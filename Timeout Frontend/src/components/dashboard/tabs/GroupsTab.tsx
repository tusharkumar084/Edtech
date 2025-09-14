import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Camera, Video } from "lucide-react";
import { GroupSession } from "@/components/group/GroupSession";

export const GroupsTab = () => {
  const [activeGroupSession, setActiveGroupSession] = useState<{
    groupId: string;
    groupName: string;
  } | null>(null);

  // Mock groups data
  const groups = [
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

  const handleEnterGroup = (groupName: string, index: number) => {
    setActiveGroupSession({
      groupId: `group-${index}`,
      groupName: groupName
    });
  };

  const handleLeaveGroup = () => {
    setActiveGroupSession(null);
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
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          Join Group
        </Button>
      </div>

      {/* Your Groups */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
        
        {groups.map((group, index) => (
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