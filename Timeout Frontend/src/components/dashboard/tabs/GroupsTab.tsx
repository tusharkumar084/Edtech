import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Camera, Video } from "lucide-react";
import { GroupSession } from "@/components/group/GroupSession";
import { getPublicRooms, createRoom, joinRoom } from "@/config/firebase";

export const GroupsTab = () => {
  const { user } = useUser();
  const [activeGroupSession, setActiveGroupSession] = useState<{
    groupId: string;
    groupName: string;
  } | null>(null);
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock groups data (fallback while integrating)
  const mockGroups = [
    {
      name: "Focus Buddies",
      members: 5,
      isStudying: true,
      activeMembers: ["Alex", "Sarah"],
      description: "Late night study sessions"
    },
    {
      name: "Math Warriors",
      members: 8,
      isStudying: false,
      activeMembers: [],
      description: "Conquering calculus together"
    },
    {
      name: "Night Owls",
      members: 12,
      isStudying: true,
      activeMembers: ["Mike", "Emma", "Jack"],
      description: "For the midnight studiers"
    },
  ];

  // Load rooms from backend
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getPublicRooms({ 
          limit: 10,
          userId: user?.id || 'demo-user'
        });
        
        // Transform backend room data to match frontend format
        const backendRooms = (result.data as any).rooms || [];
        const transformedRooms = backendRooms.map((room: any) => ({
          name: room.name,
          members: room.participants || 0,
          isStudying: room.status === 'active',
          activeMembers: [], // We'll populate this later
          description: room.description || room.subject || "Study session",
          roomId: room.id
        }));
        
        setRooms(transformedRooms);
      } catch (err) {
        console.error('Failed to load rooms:', err);
        setError('Failed to load study rooms');
        // Keep using mock data on error
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleEnterGroup = async (groupName: string, index: number) => {
    const currentRooms = rooms.length > 0 ? rooms : mockGroups;
    const room = currentRooms[index];
    
    // If it's a real room with roomId, use joinRoom function
    if (room.roomId) {
      try {
        setLoading(true);
        const result = await joinRoom({ 
          roomId: room.roomId,
          userId: user?.id || 'demo-user'
        });
        console.log('✅ Joined room:', result.data);
        
        setActiveGroupSession({
          groupId: room.roomId,
          groupName: groupName
        });
      } catch (error) {
        console.error('❌ Failed to join room:', error);
        setError('Failed to join room');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback for mock data
      setActiveGroupSession({
        groupId: `group-${index}`,
        groupName: groupName
      });
    }
  };

  const handleLeaveGroup = () => {
    setActiveGroupSession(null);
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a new room with default settings
      const result = await createRoom({
        name: `Study Room ${Date.now()}`,
        description: 'Focus study session',
        visibility: 'public',
        maxParticipants: 8,
        subject: 'General',
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        // For emulator mode - pass userId
        userId: user?.id || 'demo-user'
      });
      
      console.log('✅ Created room:', result.data);
      
      // Automatically join the newly created room
      const responseData = result.data as any;
      setActiveGroupSession({
        groupId: responseData.roomId,
        groupName: responseData.room.name
      });
      
    } catch (error) {
      console.error('❌ Failed to create room:', error);
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  // If user is in a group session, show the GroupSession component
  if (activeGroupSession) {
    return (
      <GroupSession
        groupName={activeGroupSession.groupName}
        groupId={activeGroupSession.groupId}
        onLeaveGroup={handleLeaveGroup}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Groups</h1>
          <p className="text-muted-foreground">Connect with peers for accountability</p>
        </div>
        <Button variant="hero" onClick={handleCreateRoom} disabled={loading}>
          <Plus className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Room'}
        </Button>
      </div>

      {/* Your Groups */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
        
        {/* Error Display */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}
        
        {/* Loading State */}
        {loading && rooms.length === 0 && (
          <Card className="glass p-6">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading study rooms...</span>
            </div>
          </Card>
        )}
        
        {(rooms.length > 0 ? rooms : mockGroups).map((group, index) => (
          <Card key={index} className="glass p-6 hover:bg-glass/60 transition-smooth">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{group.members} members</span>
                    {group.isStudying && (
                      <Badge variant="outline" className="text-success border-success">
                        <div className="w-2 h-2 rounded-full bg-success mr-1 animate-pulse" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEnterGroup(group.name, index)}
              >
                Enter Group
              </Button>
            </div>

            {/* Active Members */}
            {group.activeMembers.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Currently studying:</p>
                <div className="space-y-2">
                  {group.activeMembers.map((member, memberIndex) => (
                    <div key={memberIndex} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Camera className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{member}</p>
                        <p className="text-xs text-muted-foreground">Studying Mathematics</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Camera Check-in Info */}
      <Card className="glass p-6 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Camera Check-ins</h3>
            <p className="text-sm text-muted-foreground mb-3">
              When you start a study session in a group, your camera will take periodic photos 
              to share with your study buddies for accountability.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Every 15-20 seconds</Badge>
              <Badge variant="outline">Privacy controls available</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Discover Groups */}
      <Card className="glass p-6">
        <h3 className="font-semibold text-foreground mb-4">Discover New Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-smooth cursor-pointer">
            <h4 className="font-medium text-foreground">Pre-Med Students</h4>
            <p className="text-sm text-muted-foreground">24 members • Very active</p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-smooth cursor-pointer">
            <h4 className="font-medium text-foreground">CS Study Group</h4>
            <p className="text-sm text-muted-foreground">15 members • Active</p>
          </div>
        </div>
      </Card>
    </div>
  );
};