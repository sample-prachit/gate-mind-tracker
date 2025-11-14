import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  completedTopics: number;
  completionPercentage: number;
  testCount: number;
  averageTestScore: number;
  studyHours: number;
}

interface PerformanceAnalyticsProps {
  subjectPerformance: SubjectPerformance[];
}

export const PerformanceAnalytics = ({ subjectPerformance }: PerformanceAnalyticsProps) => {
  const getPerformanceStatus = (completionPercentage: number) => {
    if (completionPercentage >= 80) return { status: "excellent", icon: TrendingUp, color: "text-green-500" };
    if (completionPercentage >= 60) return { status: "good", icon: Target, color: "text-blue-500" };
    if (completionPercentage >= 40) return { status: "average", icon: Target, color: "text-yellow-500" };
    return { status: "needs work", icon: TrendingDown, color: "text-red-500" };
  };

  const getTestScoreStatus = (score: number) => {
    if (score >= 80) return { status: "excellent", color: "text-green-500" };
    if (score >= 60) return { status: "good", color: "text-blue-500" };
    if (score >= 40) return { status: "average", color: "text-yellow-500" };
    return { status: "needs improvement", color: "text-red-500" };
  };

  const sortedByCompletion = [...subjectPerformance].sort((a, b) => b.completionPercentage - a.completionPercentage);
  const sortedByTestScore = [...subjectPerformance].filter(s => s.testCount > 0).sort((a, b) => b.averageTestScore - a.averageTestScore);

  if (subjectPerformance.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No data yet. Start adding subjects and tracking your progress!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Performance Analytics</h2>

      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="completion">Subject-wise Completion</TabsTrigger>
          <TabsTrigger value="tests">Subject-wise Test Scores</TabsTrigger>
        </TabsList>

        {/* Topic Completion by Subject */}
        <TabsContent value="completion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sortedByCompletion.map((subject) => {
              const { status, icon: Icon, color } = getPerformanceStatus(subject.completionPercentage);

              return (
                <Card key={subject.subjectId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{subject.subjectName}</CardTitle>
                      <Badge variant="secondary" className={color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Topics Completed</span>
                        <span className="font-semibold text-foreground">
                          {subject.completedTopics}/{subject.totalTopics}
                        </span>
                      </div>
                      <Progress value={subject.completionPercentage} />
                      <div className="text-xs text-center text-muted-foreground">
                        {subject.completionPercentage.toFixed(1)}% complete
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Test Performance by Subject */}
        <TabsContent value="tests" className="space-y-4">
          {sortedByTestScore.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center">
                  No test data available yet. Start adding test scores!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedByTestScore.map((subject) => {
                const { status, color } = getTestScoreStatus(subject.averageTestScore);

                return (
                  <Card key={subject.subjectId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{subject.subjectName}</CardTitle>
                        <Badge variant="secondary" className={color}>
                          {status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-semibold text-foreground">
                            {subject.averageTestScore.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={subject.averageTestScore} />
                        <div className="text-xs text-center text-muted-foreground">
                          Based on {subject.testCount} test{subject.testCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
