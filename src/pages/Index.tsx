import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SubjectTracker } from "@/components/SubjectTracker";
import { MockTestTracker } from "@/components/MockTestTracker";
import { StudyTimeLogger } from "@/components/StudyTimeLogger";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { StreakCalendar } from "@/components/StreakCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";

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
}

interface MockTest {
  id: string;
  date: string;
  score: number;
  totalMarks: number;
}

interface StudySession {
  id: string;
  date: string;
  hours: number;
}

const Index = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: "math",
      name: "Engineering Mathematics",
      color: "bg-chart-1/10 text-chart-1",
      topics: [
        { id: "1", name: "Linear Algebra", completed: true },
        { id: "2", name: "Calculus", completed: true },
        { id: "3", name: "Differential Equations", completed: false },
        { id: "4", name: "Probability & Statistics", completed: false },
      ],
    },
    {
      id: "digital",
      name: "Digital Logic",
      color: "bg-chart-2/10 text-chart-2",
      topics: [
        { id: "1", name: "Boolean Algebra", completed: true },
        { id: "2", name: "Combinational Circuits", completed: false },
        { id: "3", name: "Sequential Circuits", completed: false },
      ],
    },
    {
      id: "algorithms",
      name: "Algorithms",
      color: "bg-chart-3/10 text-chart-3",
      topics: [
        { id: "1", name: "Sorting & Searching", completed: true },
        { id: "2", name: "Dynamic Programming", completed: false },
        { id: "3", name: "Graph Algorithms", completed: false },
        { id: "4", name: "Greedy Algorithms", completed: false },
      ],
    },
    {
      id: "os",
      name: "Operating Systems",
      color: "bg-chart-4/10 text-chart-4",
      topics: [
        { id: "1", name: "Process Management", completed: false },
        { id: "2", name: "Memory Management", completed: false },
        { id: "3", name: "File Systems", completed: false },
      ],
    },
  ]);

  const [mockTests, setMockTests] = useState<MockTest[]>([
    { id: "1", date: "2025-11-07", score: 65, totalMarks: 100 },
    { id: "2", date: "2025-11-10", score: 72, totalMarks: 100 },
    { id: "3", date: "2025-11-13", score: 78, totalMarks: 100 },
  ]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([
    { id: "1", date: "2025-11-08", hours: 3 },
    { id: "2", date: "2025-11-09", hours: 4 },
    { id: "3", date: "2025-11-10", hours: 2.5 },
    { id: "4", date: "2025-11-11", hours: 5 },
    { id: "5", date: "2025-11-12", hours: 3.5 },
    { id: "6", date: "2025-11-13", hours: 4 },
    { id: "7", date: "2025-11-14", hours: 3 },
  ]);

  const handleToggleTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: subject.topics.map((topic) =>
                topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
              ),
            }
          : subject
      )
    );
  };

  const handleAddMockTest = (score: number, totalMarks: number) => {
    const newTest: MockTest = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      score,
      totalMarks,
    };
    setMockTests((prev) => [...prev, newTest]);
  };

  const handleAddStudySession = (hours: number) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      hours,
    };
    setStudySessions((prev) => [...prev, newSession]);
  };

  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    const sortedDates = [...new Set(studySessions.map((s) => s.date))].sort().reverse();

    for (const date of sortedDates) {
      const sessionDate = new Date(date);
      const daysDiff = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const completedTopics = subjects.reduce(
    (sum, subject) => sum + subject.topics.filter((t) => t.completed).length,
    0
  );
  const averageScore =
    mockTests.length > 0
      ? mockTests.reduce((sum, test) => sum + (test.score / test.totalMarks) * 100, 0) /
        mockTests.length
      : 0;
  const thisWeekHours = studySessions.reduce((sum, session) => sum + session.hours, 0);
  const studyStreak = calculateStreak();

  const subjectPerformance = subjects.map((subject) => ({
    subject: subject.name,
    score: Math.random() * 30 + 60, // Sample data
    targetScore: 80,
  }));

  const studyDates = [...new Set(studySessions.map((s) => s.date))];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">GATE Exam Tracker</h1>
        </div>

        <Dashboard
          studyStreak={studyStreak}
          totalStudyTime={thisWeekHours}
          averageScore={averageScore}
          topicsCompleted={completedTopics}
          totalTopics={totalTopics}
        />

        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="tests">Mock Tests</TabsTrigger>
            <TabsTrigger value="study">Study Log</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <SubjectTracker subjects={subjects} onToggleTopic={handleToggleTopic} />
          </TabsContent>

          <TabsContent value="tests">
            <MockTestTracker mockTests={mockTests} onAddMockTest={handleAddMockTest} />
          </TabsContent>

          <TabsContent value="study">
            <StudyTimeLogger
              studySessions={studySessions}
              onAddSession={handleAddStudySession}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <PerformanceAnalytics subjectPerformance={subjectPerformance} />
          </TabsContent>

          <TabsContent value="streak">
            <StreakCalendar studyDates={studyDates} currentStreak={studyStreak} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
