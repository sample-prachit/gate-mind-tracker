import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCalendarProps {
  studyDates: string[];
  currentStreak: number;
}

export const StreakCalendar = ({ studyDates, currentStreak }: StreakCalendarProps) => {
  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const last30Days = getLast30Days();
  const studyDateSet = new Set(studyDates);

  const getIntensity = (date: string) => {
    if (!studyDateSet.has(date)) return "bg-muted";
    return "bg-accent";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Study Streak</h2>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>30-Day Heatmap</CardTitle>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2">
            {last30Days.map((date) => (
              <div
                key={date}
                className={`aspect-square rounded ${getIntensity(date)} transition-colors`}
                title={new Date(date).toLocaleDateString()}
              />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">30 days ago</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded bg-muted" />
                <div className="w-3 h-3 rounded bg-accent opacity-50" />
                <div className="w-3 h-3 rounded bg-accent" />
              </div>
              <span>More</span>
            </div>
            <span className="hidden sm:inline">Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
