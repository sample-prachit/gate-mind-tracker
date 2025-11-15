import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Timer } from "lucide-react";
import React, { useState, useRef } from "react";

interface StudySession {
  id: string;
  date: string;
  hours: number;
}

interface StudyTimeLoggerProps {
  studySessions: StudySession[];
  onAddSession: (hours: number) => void;
}


export const StudyTimeLogger = ({ studySessions, onAddSession }: StudyTimeLoggerProps) => {
  const [tab, setTab] = useState<'manual' | 'stopwatch'>('manual');
  const [hours, setHours] = useState("");

  // Stopwatch state - load from localStorage on mount
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('stopwatch_isRunning');
    return saved ? JSON.parse(saved) : false;
  });
  const [elapsed, setElapsed] = useState(() => {
    const saved = localStorage.getItem('stopwatch_elapsed');
    const savedTime = saved ? parseInt(saved) : 0;
    const savedTimestamp = localStorage.getItem('stopwatch_timestamp');
    
    // If stopwatch was running, calculate elapsed time since last save
    if (savedTimestamp && JSON.parse(localStorage.getItem('stopwatch_isRunning') || 'false')) {
      const lastTimestamp = parseInt(savedTimestamp);
      const now = Date.now();
      const additionalSeconds = Math.floor((now - lastTimestamp) / 1000);
      return savedTime + additionalSeconds;
    }
    
    return savedTime;
  }); // seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save stopwatch state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('stopwatch_isRunning', JSON.stringify(isRunning));
    localStorage.setItem('stopwatch_elapsed', elapsed.toString());
    localStorage.setItem('stopwatch_timestamp', Date.now().toString());
  }, [isRunning, elapsed]);

  // Stopwatch logic
  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
  };
  const pauseStopwatch = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const resetStopwatch = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
    localStorage.removeItem('stopwatch_isRunning');
    localStorage.removeItem('stopwatch_elapsed');
    localStorage.removeItem('stopwatch_timestamp');
  };
  const saveStopwatch = () => {
    if (elapsed > 0) {
      const hoursValue = +(elapsed / 3600).toFixed(2);
      onAddSession(hoursValue);
      resetStopwatch();
    }
  };

  // Auto-start stopwatch if it was running when page loaded
  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Clear stopwatch when browser/tab is closed
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('stopwatch_isRunning');
      localStorage.removeItem('stopwatch_elapsed');
      localStorage.removeItem('stopwatch_timestamp');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours) {
      onAddSession(Number(hours));
      setHours("");
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const chartData = getLast7Days().map((date) => {
    const sessionsOnDate = studySessions.filter((s) => s.date === date);
    const totalHours = sessionsOnDate.reduce((sum, s) => sum + s.hours, 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      hours: Number(totalHours.toFixed(2)),
      fullDate: date,
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Study Time Log</h2>

      <div className="flex gap-2 mb-2">
        <Button
          variant={tab === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('manual')}
        >
          <Clock className="h-4 w-4 mr-1" /> Add Hours
        </Button>
        <Button
          variant={tab === 'stopwatch' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('stopwatch')}
        >
          <Timer className="h-4 w-4 mr-1" /> Stopwatch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tab === 'manual' ? 'Log Study Session' : 'Stopwatch Timer'}</CardTitle>
          </CardHeader>
          <CardContent>
            {tab === 'manual' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Studied</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    placeholder="Enter hours (e.g., 2.5)"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    min="0.5"
                    max="24"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!hours || Number(hours) <= 0}>
                  <Clock className="h-4 w-4 mr-2" />
                  Log Session
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="text-3xl sm:text-4xl font-mono tracking-widest mb-2">
                  {`${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {!isRunning ? (
                    <Button onClick={startStopwatch} variant="default" size="sm">
                      Start
                    </Button>
                  ) : (
                    <Button onClick={pauseStopwatch} variant="secondary" size="sm">
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetStopwatch} variant="outline" size="sm">
                    Reset
                  </Button>
                  <Button onClick={saveStopwatch} variant="default" size="sm" disabled={elapsed === 0}>
                    Save
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-1">
                  {elapsed > 0 ? `${(elapsed / 3600).toFixed(2)} hours will be saved` : 'Start the timer to track your study session'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {studySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No study sessions logged yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first session to see the chart!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    formatter={(value: number) => [`${value} hours`, 'Study Time']}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
