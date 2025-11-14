import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";
import { useState } from "react";

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
  const [hours, setHours] = useState("");

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
      hours: totalHours,
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Study Time Log</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log Study Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Studied</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  placeholder="Enter hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0.5"
                  max="24"
                />
              </div>
              <Button type="submit" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Log Session
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
