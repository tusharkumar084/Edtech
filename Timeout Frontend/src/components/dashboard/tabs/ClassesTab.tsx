import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, BookOpen, X } from "lucide-react";

export const ClassesTab = () => {
  const [showLiveClass, setShowLiveClass] = useState(false);
  // Mock class data
  const liveClass = {
    subject: "Physics",
    time: "09:00-10:00",
    teacher: "Dr. Smith",
    participants: 24
  };

  const upcomingClasses = [
    {
      subject: "Mathematics",
      time: "10:30-11:30",
      teacher: "Prof. Johnson",
      startsIn: "1h 20m",
      participants: 18
    },
    {
      subject: "English Literature",
      time: "13:00-14:00",
      teacher: "Ms. Davis",
      startsIn: "3h 50m",
      participants: 22
    },
    {
      subject: "Chemistry",
      time: "15:30-16:30",
      teacher: "Dr. Wilson",
      startsIn: "6h 20m",
      participants: 15
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Live Class Modal */}
      {showLiveClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl p-6 relative">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setShowLiveClass(false)}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-2">Live Class: {liveClass.subject} ({liveClass.time})</h2>
            <div className="flex gap-6">
              {/* Teacher Video */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-64 h-40 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <span className="text-muted-foreground">[Teacher Video]</span>
                </div>
                <div className="font-semibold text-primary">{liveClass.teacher} (Teacher)</div>
              </div>
              {/* Students Grid */}
              <div className="w-48 flex flex-col gap-2">
                <div className="font-semibold mb-1">Students</div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Placeholder student videos */}
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-14 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Student {i+1}</div>
                  ))}
                </div>
              </div>
            </div>
            {/* Class Timer and Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">00:00:00</span>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="sm">Chat</Button>
                <Button variant="outline" size="sm">Participants</Button>
                <Button variant="destructive" size="sm" onClick={() => setShowLiveClass(false)}>Leave Class</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Classes</h1>
        <p className="text-muted-foreground">Join live classes and view your schedule</p>
      </div>

      {/* Live Class */}
      <Card className="glass p-6 border-live/30 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-live/20 flex items-center justify-center">
              <Video className="w-6 h-6 text-live" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="live" className="text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse" />
                  LIVE
                </Badge>
                <span className="text-lg font-semibold text-foreground">{liveClass.subject}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{liveClass.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{liveClass.teacher}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{liveClass.participants} joined</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="live" size="lg" className="animate-pulse" onClick={() => setShowLiveClass(true)}>
            <Video className="w-4 h-4" />
            Join Class
          </Button>
        </div>
      </Card>

      {/* Upcoming Classes */}
      <Card className="glass p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Classes</h2>
        <div className="space-y-3">
          {upcomingClasses.map((classItem, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg glass hover:bg-glass/60 transition-smooth">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{classItem.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{classItem.teacher}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Starts in {classItem.startsIn}
                </Badge>
                <p className="text-xs text-muted-foreground">{classItem.participants} enrolled</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar View */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Class Calendar</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Week</Button>
            <Button variant="outline" size="sm">Month</Button>
          </div>
        </div>
        
        <div className="glass p-8 rounded-lg text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Calendar view coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            View all your classes in a beautiful calendar interface.
          </p>
        </div>
      </Card>
    </div>
  );
};