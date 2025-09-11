import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Clock } from "lucide-react";

export const ScheduleMaker = () => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Mock schedule data
  const scheduleItems = [
    { time: "09:00-10:00", subject: "Mathematics", type: "study", color: "bg-primary" },
    { time: "10:30-11:30", subject: "Physics Class", type: "class", color: "bg-success" },
    { time: "14:00-15:00", subject: "Study Group", type: "group", color: "bg-warning" },
    { time: "16:00-17:00", subject: "English", type: "study", color: "bg-primary" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule Maker</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{currentTime}</div>
          <p className="text-sm text-muted-foreground">Current time</p>
        </div>
      </div>

      {/* Quick Add */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Today's Schedule</h2>
          <Button variant="hero" size="sm">
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {scheduleItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-lg glass hover:bg-glass/60 transition-smooth">
              <div className={`w-3 h-12 rounded-full ${item.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.time}</span>
                </div>
                <h3 className="font-medium text-foreground">{item.subject}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Calendar View */}
      <Card className="glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Calendar View</h2>
        </div>
        
        <div className="glass p-8 rounded-lg text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Interactive calendar coming soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            Drag & drop events, week/month views, and more.
          </p>
        </div>
      </Card>
    </div>
  );
};