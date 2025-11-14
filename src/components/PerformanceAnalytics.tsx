import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface SubjectPerformance {
  subject: string;
  score: number;
  targetScore: number;
}

interface PerformanceAnalyticsProps {
  subjectPerformance: SubjectPerformance[];
}

export const PerformanceAnalytics = ({ subjectPerformance }: PerformanceAnalyticsProps) => {
  const getPerformanceStatus = (score: number, target: number) => {
    const diff = score - target;
    if (diff >= 0) return { status: "strong", icon: TrendingUp, color: "text-success" };
    if (diff >= -10) return { status: "on track", icon: Target, color: "text-warning" };
    return { status: "needs work", icon: TrendingDown, color: "text-destructive" };
  };

  const overallProgress =
    subjectPerformance.reduce((sum, s) => sum + s.score, 0) / subjectPerformance.length;
  const overallTarget =
    subjectPerformance.reduce((sum, s) => sum + s.targetScore, 0) / subjectPerformance.length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Average</span>
              <span className="text-2xl font-bold text-foreground">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={(overallProgress / overallTarget) * 100} />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Target: {overallTarget.toFixed(1)}%</span>
              <span
                className={
                  overallProgress >= overallTarget ? "text-success" : "text-warning"
                }
              >
                Gap: {Math.abs(overallProgress - overallTarget).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {subjectPerformance.map((subject) => {
          const { status, icon: Icon, color } = getPerformanceStatus(
            subject.score,
            subject.targetScore
          );
          const progressPercentage = (subject.score / subject.targetScore) * 100;

          return (
            <Card key={subject.subject}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{subject.subject}</CardTitle>
                  <Badge variant="secondary" className={color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-semibold text-foreground">{subject.score}%</span>
                  </div>
                  <Progress value={progressPercentage} />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-semibold text-foreground">{subject.targetScore}%</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {subject.score >= subject.targetScore
                      ? `${(subject.score - subject.targetScore).toFixed(1)}% above target`
                      : `${(subject.targetScore - subject.score).toFixed(1)}% to reach target`}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
