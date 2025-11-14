import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type TestType = "mock" | "subject" | "unit";

interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  color: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  completedHours: number;
  inProgressHours: number;
}

export interface Test {
  id: string;
  date: string;
  score: number;
  totalMarks: number;
  testType: TestType;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
}

interface TestTrackerProps {
  tests: Test[];
  subjects: Subject[];
  onAddTest: (score: number, totalMarks: number, testType: TestType, subjectId?: string, subjectName?: string, unitId?: string, unitName?: string) => void;
  onDeleteTest: (testId: string) => void;
}

export const TestTracker = ({ tests, subjects, onAddTest, onDeleteTest }: TestTrackerProps) => {
  // Mock test form state
  const [mockScore, setMockScore] = useState("");
  const [mockTotalMarks, setMockTotalMarks] = useState("");

  // Subject test form state
  const [subjectScore, setSubjectScore] = useState("");
  const [subjectTotalMarks, setSubjectTotalMarks] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Unit test form state
  const [unitScore, setUnitScore] = useState("");
  const [unitTotalMarks, setUnitTotalMarks] = useState("");
  const [unitSubject, setUnitSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockScore && mockTotalMarks) {
      onAddTest(Number(mockScore), Number(mockTotalMarks), "mock");
      setMockScore("");
      setMockTotalMarks("");
    }
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectScore && subjectTotalMarks && selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      onAddTest(
        Number(subjectScore), 
        Number(subjectTotalMarks), 
        "subject",
        selectedSubject,
        subject?.name
      );
      setSubjectScore("");
      setSubjectTotalMarks("");
      setSelectedSubject("");
    }
  };

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unitScore && unitTotalMarks && unitSubject && selectedUnit) {
      const subject = subjects.find(s => s.id === unitSubject);
      const unit = subject?.topics.find(t => t.id === selectedUnit);
      onAddTest(
        Number(unitScore), 
        Number(unitTotalMarks), 
        "unit",
        unitSubject,
        subject?.name,
        selectedUnit,
        unit?.name
      );
      setUnitScore("");
      setUnitTotalMarks("");
      setUnitSubject("");
      setSelectedUnit("");
    }
  };

  const mockTests = tests.filter(t => t.testType === "mock");
  const subjectTests = tests.filter(t => t.testType === "subject");
  const unitTests = tests.filter(t => t.testType === "unit");

  const getMockChartData = () => mockTests.map((test, index) => ({
    test: `Test ${index + 1}`,
    percentage: (test.score / test.totalMarks) * 100,
  }));

  const getSubjectChartData = () => subjectTests.map((test, index) => ({
    test: `Test ${index + 1}`,
    percentage: (test.score / test.totalMarks) * 100,
  }));

  const getUnitChartData = () => unitTests.map((test, index) => ({
    test: `Test ${index + 1}`,
    percentage: (test.score / test.totalMarks) * 100,
  }));

  const getTestTypeBadgeColor = (type: TestType) => {
    switch (type) {
      case "mock":
        return "bg-blue-500 hover:bg-blue-600";
      case "subject":
        return "bg-green-500 hover:bg-green-600";
      case "unit":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const renderTestList = (testList: Test[]) => {
    if (testList.length === 0) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testList.slice().reverse().map((test) => {
              const percentage = ((test.score / test.totalMarks) * 100).toFixed(1);
              return (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">
                        {new Date(test.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      {test.subjectName && (
                        <Badge variant="outline">{test.subjectName}</Badge>
                      )}
                      {test.unitName && (
                        <Badge variant="outline" className="text-xs">{test.unitName}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {test.score} / {test.totalMarks}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-primary">{percentage}%</div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Test?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this test record. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteTest(test.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Test Performance</h2>

      <Tabs defaultValue="mock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mock">Mock Tests</TabsTrigger>
          <TabsTrigger value="subject">Subject Tests</TabsTrigger>
          <TabsTrigger value="unit">Unit Tests</TabsTrigger>
        </TabsList>

        {/* Mock Test Tab */}
        <TabsContent value="mock" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Mock Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMockSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mockScore">Score Obtained</Label>
                    <Input
                      id="mockScore"
                      type="number"
                      placeholder="Enter score"
                      value={mockScore}
                      onChange={(e) => setMockScore(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mockTotal">Total Marks</Label>
                    <Input
                      id="mockTotal"
                      type="number"
                      placeholder="Enter total marks"
                      value={mockTotalMarks}
                      onChange={(e) => setMockTotalMarks(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mock Test
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {getMockChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getMockChartData()}>
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
                    No mock test data yet. Add your first test!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {renderTestList(mockTests)}
        </TabsContent>

        {/* Subject Test Tab */}
        <TabsContent value="subject" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Subject Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectSelect">Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger id="subjectSelect">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectScore">Score Obtained</Label>
                    <Input
                      id="subjectScore"
                      type="number"
                      placeholder="Enter score"
                      value={subjectScore}
                      onChange={(e) => setSubjectScore(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectTotal">Total Marks</Label>
                    <Input
                      id="subjectTotal"
                      type="number"
                      placeholder="Enter total marks"
                      value={subjectTotalMarks}
                      onChange={(e) => setSubjectTotalMarks(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!selectedSubject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subject Test
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {getSubjectChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getSubjectChartData()}>
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
                    No subject test data yet. Add your first test!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {renderTestList(subjectTests)}
        </TabsContent>

        {/* Unit Test Tab */}
        <TabsContent value="unit" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Unit Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUnitSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitSubjectSelect">Subject</Label>
                    <Select value={unitSubject} onValueChange={(value) => {
                      setUnitSubject(value);
                      setSelectedUnit(""); // Reset unit when subject changes
                    }}>
                      <SelectTrigger id="unitSubjectSelect">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitSelect">Unit</Label>
                    <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={!unitSubject}>
                      <SelectTrigger id="unitSelect">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitSubject && subjects.find(s => s.id === unitSubject)?.topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitScore">Score Obtained</Label>
                    <Input
                      id="unitScore"
                      type="number"
                      placeholder="Enter score"
                      value={unitScore}
                      onChange={(e) => setUnitScore(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitTotal">Total Marks</Label>
                    <Input
                      id="unitTotal"
                      type="number"
                      placeholder="Enter total marks"
                      value={unitTotalMarks}
                      onChange={(e) => setUnitTotalMarks(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!unitSubject || !selectedUnit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit Test
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {getUnitChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={getUnitChartData()}>
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
                    No unit test data yet. Add your first test!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {renderTestList(unitTests)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
