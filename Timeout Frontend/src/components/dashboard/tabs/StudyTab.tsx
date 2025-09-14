import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, Square, Plus, BookOpen, Clock, CheckCircle } from "lucide-react";

export const StudyTab = () => {
  // Initialize from localStorage or defaults
  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).timer : 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).isRunning : false;
  });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).selectedSubject : null;
  });
  const [originalDuration, setOriginalDuration] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).originalDuration : 25 * 60;
  });
  const [isCompleted, setIsCompleted] = useState(false); // Don't persist completion state
  const [showCompletionAlert, setShowCompletionAlert] = useState(false); // Don't persist alert state

  // Save state to localStorage whenever key states change
  useEffect(() => {
    const timerState = {
      timer,
      isRunning,
      selectedSubject,
      originalDuration,
      lastSaved: Date.now()
    };
    localStorage.setItem('studyTimer', JSON.stringify(timerState));
  }, [timer, isRunning, selectedSubject, originalDuration]);

  // Restore timer accuracy on component mount if it was running
  useEffect(() => {
    const saved = localStorage.getItem('studyTimer');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.isRunning && state.lastSaved) {
        const elapsed = Math.floor((Date.now() - state.lastSaved) / 1000);
        const newTimer = Math.max(0, state.timer - elapsed);
        setTimer(newTimer);
        if (newTimer === 0) {
          setIsRunning(false);
          setIsCompleted(true);
        }
      }
    }
  }, []); // Only run on mount

  // Mock subjects data
  const subjects = [
    { name: "Mathematics", totalTime: "2h 15m", color: "bg-primary" },
    { name: "Physics", totalTime: "1h 45m", color: "bg-success" },
    { name: "English", totalTime: "1h 05m", color: "bg-warning" },
    { name: "Chemistry", totalTime: "45m", color: "bg-destructive" },
  ];

  // Simple timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            setIsCompleted(true);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timer]);

  // Handle timer completion in separate effect
  useEffect(() => {
    if (isCompleted) {
      setIsRunning(false);
      setIsCompleted(false);
      setShowCompletionAlert(true);
      
      // Play completion sound (if supported)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ2/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzuZ');
        audio.play().catch(() => {
          // Silent fail if audio doesn't work
        });
      } catch (error) {
        // Silent fail if audio creation fails
      }
      
      // Auto-hide alert after 10 seconds
      setTimeout(() => {
        setShowCompletionAlert(false);
      }, 10000);
    }
  }, [isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedSubject && timer > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimer(originalDuration); // FIXED: Reset to original duration, not hardcoded 25 minutes
  };

  const setTimerPreset = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setTimer(seconds);
      setOriginalDuration(seconds); // Remember the selected duration
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Timer</h1>
        <p className="text-muted-foreground">Track your focused study sessions</p>
      </div>

      {/* Timer Completion Alert */}
      {showCompletionAlert && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>🎉 Study Session Complete!</strong> Great work! You've successfully completed your {Math.floor(originalDuration / 60)}-minute study session
            {selectedSubject && ` for ${selectedSubject}`}. Take a well-deserved break!
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-4"
              onClick={() => setShowCompletionAlert(false)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
              onClick={() => setTimerPreset(25)}
              disabled={isRunning}
            >
              25m
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTimerPreset(45)}
              disabled={isRunning}
            >
              45m
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTimerPreset(60)}
              disabled={isRunning}
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