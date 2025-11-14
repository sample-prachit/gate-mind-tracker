import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus } from "lucide-react";
import { useState } from "react";

interface MockTest {
  id: string;
  date: string;
  score: number;
  totalMarks: number;
}

interface MockTestTrackerProps {
  mockTests: MockTest[];
  onAddMockTest: (score: number, totalMarks: number) => void;
}

export const MockTestTracker = ({ mockTests, onAddMockTest }: MockTestTrackerProps) => {
  const [score, setScore] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score && totalMarks) {
      onAddMockTest(Number(score), Number(totalMarks));
      setScore("");
      setTotalMarks("");
    }
  };

  const chartData = mockTests.map((test, index) => ({
    test: `Test ${index + 1}`,
    percentage: (test.score / test.totalMarks) * 100,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Mock Test Performance</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Mock Test Score</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="score">Score Obtained</Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="Enter score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Marks</Label>
                <Input
                  id="total"
                  type="number"
                  placeholder="Enter total marks"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  min="1"
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Test
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No test data yet. Add your first mock test!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {mockTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTests.slice().reverse().map((test) => {
                const percentage = ((test.score / test.totalMarks) * 100).toFixed(1);
                return (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {test.score} / {test.totalMarks}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
