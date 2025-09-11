import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Plus, BookOpen, Clock } from "lucide-react";

export const StudyTab = () => {
  const [timer, setTimer] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Mock subjects data
  const subjects = [
    { name: "Mathematics", totalTime: "2h 15m", color: "bg-primary" },
    { name: "Physics", totalTime: "1h 45m", color: "bg-success" },
    { name: "English", totalTime: "1h 05m", color: "bg-warning" },
    { name: "Chemistry", totalTime: "45m", color: "bg-destructive" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedSubject) {
      setIsRunning(true);
      // TODO: Start timer countdown
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    // TODO: Pause timer
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimer(25 * 60);
    // TODO: Log study session
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Timer</h1>
        <p className="text-muted-foreground">Track your focused study sessions</p>
      </div>

      {/* Timer Section */}
      <Card className="glass p-8">
        <div className="text-center space-y-6">
          {/* Timer Display */}
          <div className="space-y-2">
            <div className="text-6xl font-bold text-primary font-mono">
              {formatTime(timer)}
            </div>
            {selectedSubject && (
              <p className="text-lg text-muted-foreground">
                Studying: <span className="text-foreground font-medium">{selectedSubject}</span>
              </p>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <Button 
                variant="hero" 
                size="lg"
                onClick={handleStart}
                disabled={!selectedSubject}
              >
                <Play className="w-5 h-5" />
                Start
              </Button>
            ) : (
              <>
                <Button variant="outline" size="lg" onClick={handlePause}>
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
                <Button variant="destructive" size="lg" onClick={handleStop}>
                  <Square className="w-5 h-5" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Timer Presets */}
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTimer(25 * 60)}
            >
              25m
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTimer(45 * 60)}
            >
              45m
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTimer(60 * 60)}
            >
              60m
            </Button>
          </div>
        </div>
      </Card>

      {/* Subjects Section */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4" />
            Add Subject
          </Button>
        </div>

        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg glass cursor-pointer transition-smooth hover:bg-glass/60 ${
                selectedSubject === subject.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedSubject(subject.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-8 rounded-full ${subject.color}`} />
                  <div>
                    <h3 className="font-medium text-foreground">{subject.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Total: {subject.totalTime}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={selectedSubject === subject.name ? "hero" : "ghost"} 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubject(subject.name);
                    handleStart();
                  }}
                  disabled={isRunning}
                >
                  <BookOpen className="w-4 h-4" />
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};