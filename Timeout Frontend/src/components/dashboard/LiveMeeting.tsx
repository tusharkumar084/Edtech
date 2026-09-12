import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, Phone, Video } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/config/firebase-client";

interface LiveMeetingProps {
  classId: string;
  userType: "teacher" | "student";
}

const configuration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const LiveMeeting = ({ classId, userType }: LiveMeetingProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const stopListenersRef = useRef<Array<() => void>>([]);
  const [meetingActive, setMeetingActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [error, setError] = useState("");

  const clearMeeting = () => {
    stopListenersRef.current.forEach((stop) => stop());
    stopListenersRef.current = [];
    connectionRef.current?.close();
    connectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setMeetingActive(false);
    setConnected(false);
  };

  useEffect(() => clearMeeting, []);

  const getLocalMedia = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera and microphone access is not supported in this browser.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createConnection = (roomId: string, stream: MediaStream) => {
    const connection = new RTCPeerConnection(configuration);
    connectionRef.current = connection;
    stream.getTracks().forEach((track) => connection.addTrack(track, stream));
    connection.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setConnected(true);
    };
    connection.onicecandidate = async (event) => {
      if (event.candidate) {
        const path = userType === "teacher" ? "teacherCandidates" : "studentCandidates";
        await addDoc(collection(db, "meetingRooms", roomId, path), event.candidate.toJSON());
      }
    };
    return connection;
  };

  const startMeeting = async () => {
    try {
      setError("");
      await signInAnonymously(auth);
      const stream = await getLocalMedia();
      const roomId = classId.replace(/[^a-zA-Z0-9_-]/g, "-");
      const connection = createConnection(roomId, stream);

      if (userType === "teacher") {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        await setDoc(doc(db, "meetingRooms", roomId), {
          status: "waiting",
          offer: { type: offer.type, sdp: offer.sdp },
          teacherJoinedAt: new Date().toISOString(),
        });
        stopListenersRef.current.push(onSnapshot(doc(db, "meetingRooms", roomId), async (snapshot) => {
          const answer = snapshot.data()?.answer;
          if (answer && !connection.currentRemoteDescription) {
            await connection.setRemoteDescription(answer);
          }
        }));
        stopListenersRef.current.push(onSnapshot(collection(db, "meetingRooms", roomId, "studentCandidates"), async (snapshot) => {
          for (const change of snapshot.docChanges()) {
            if (change.type === "added") await connection.addIceCandidate(change.doc.data() as RTCIceCandidateInit);
          }
        }));
      } else {
        const stopRoom = onSnapshot(doc(db, "meetingRooms", roomId), async (snapshot) => {
          const room = snapshot.data();
          if (!room?.offer || connection.currentRemoteDescription) return;
          await connection.setRemoteDescription(room.offer);
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);
          await updateDoc(doc(db, "meetingRooms", roomId), {
            status: "connected",
            answer: { type: answer.type, sdp: answer.sdp },
          });
        });
        stopListenersRef.current.push(stopRoom);
        stopListenersRef.current.push(onSnapshot(collection(db, "meetingRooms", roomId, "teacherCandidates"), async (snapshot) => {
          for (const change of snapshot.docChanges()) {
            if (change.type === "added") await connection.addIceCandidate(change.doc.data() as RTCIceCandidateInit);
          }
        }));
      }
      setMeetingActive(true);
    } catch (meetingError) {
      clearMeeting();
      setError(meetingError instanceof Error ? meetingError.message : "Unable to start the meeting.");
    }
  };

  const toggleTrack = (kind: "video" | "audio") => {
    const track = localStreamRef.current?.getTracks().find((item) => item.kind === kind);
    if (!track) return;
    track.enabled = !track.enabled;
    if (kind === "video") setCameraEnabled(track.enabled);
    else setMicrophoneEnabled(track.enabled);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base"><Video className="h-4 w-4 text-primary" /> Teacher-Student Meeting</CardTitle>
          <Badge variant={connected ? "default" : "secondary"}>{connected ? "Connected" : meetingActive ? "Waiting" : "Not started"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {meetingActive && <div className="grid max-h-[min(60vh,520px)] grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2"><video ref={localVideoRef} autoPlay muted playsInline className="aspect-video max-h-[min(45vh,360px)] w-full rounded-md bg-black object-cover" /><video ref={remoteVideoRef} autoPlay playsInline className="aspect-video max-h-[min(45vh,360px)] w-full rounded-md bg-black object-cover" /></div>}
        <div className="flex flex-wrap gap-2">
          {!meetingActive ? <Button onClick={() => void startMeeting()}><Video className="mr-2 h-4 w-4" />{userType === "teacher" ? "Start Meeting" : "Join Meeting"}</Button> : <><Button variant="outline" onClick={() => toggleTrack("video")}><>{cameraEnabled ? <Camera className="mr-2 h-4 w-4" /> : <CameraOff className="mr-2 h-4 w-4" />}</>{cameraEnabled ? "Camera on" : "Camera off"}</Button><Button variant="outline" onClick={() => toggleTrack("audio")}><>{microphoneEnabled ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}</>{microphoneEnabled ? "Mic on" : "Mic off"}</Button><Button variant="destructive" onClick={clearMeeting}><Phone className="mr-2 h-4 w-4" />Leave meeting</Button></>}
        </div>
        {!meetingActive && <p className="text-xs text-muted-foreground">{userType === "teacher" ? "Start the room first, then ask the student to open the same Live Class and join." : "Join after your teacher starts the meeting. Camera and microphone permission is required."}</p>}
      </CardContent>
    </Card>
  );
};
