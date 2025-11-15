import { useState, useEffect } from "react";
import { fetchStudentProgress, saveStudentProgress } from "@/lib/progressApi";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { AuthModal } from "@/components/AuthModal";
import { Dashboard } from "@/components/Dashboard";
import { SubjectTracker } from "@/components/SubjectTracker";
import { MockTestTracker } from "@/components/MockTestTracker";
import { StudyTimeLogger } from "@/components/StudyTimeLogger";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { StreakCalendar } from "@/components/StreakCalendar";
import { SubjectManager } from "@/components/SubjectManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { user, loading } = useSupabaseAuth();
  console.log("Index user:", user, "loading:", loading);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([]);



  // Fetch subjects from Supabase on mount or when user changes
  useEffect(() => {
    if (!user) return;
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const data = await fetchStudentProgress(user.id, "subjects");
        if (data && data.length > 0) {
          setSubjects(data[0].progress.subjects || []);
        }
      } catch (e) {
        // Optionally handle error
      }
      setLoadingSubjects(false);
    };
    loadSubjects();
  }, [user]);

  // Save subjects to Supabase
  const persistSubjects = async (subjectsToSave: Subject[]) => {
    if (!user) return;
    await saveStudentProgress({
      student_id: user.id,
      subject: "subjects",
      progress: { subjects: subjectsToSave },
    });
  };

  const handleAddSubject = async (newSubject: Omit<Subject, "id">) => {
    const subject: Subject = {
      ...newSubject,
      id: Date.now().toString(),
    };
    setSubjects((prev) => {
      const updated = [...prev, subject];
      persistSubjects(updated);
      return updated;
    });
  };

  const handleDeleteSubject = async (subjectId: string) => {
    setSubjects((prev) => {
      const updated = prev.filter((subject) => subject.id !== subjectId);
      persistSubjects(updated);
      return updated;
    });
  };

  const handleToggleTopic = async (subjectId: string, topicId: string) => {
    setSubjects((prev) => {
      const updated = prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: subject.topics.map((topic) =>
                topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
              ),
            }
          : subject
      );
      persistSubjects(updated);
      return updated;
    });
  };

  const handleEditSubject = async (subjectId: string, updatedSubject: Omit<Subject, "id">) => {
    setSubjects((prev) => {
      const updated = prev.map((subject) =>
        subject.id === subjectId ? { ...updatedSubject, id: subjectId } : subject
      );
      persistSubjects(updated);
      return updated;
    });
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

  const subjectPerformance = subjects.map((subject) => {
    const completedTopics = subject.topics.filter((t) => t.completed).length;
    const totalTopics = subject.topics.length;
    const completionPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    
    // For now, use all mock tests as we don't have subject-specific tests yet
    const testCount = mockTests.length;
    const averageTestScore = testCount > 0 
      ? mockTests.reduce((sum, test) => sum + (test.score / test.totalMarks) * 100, 0) / testCount 
      : 0;
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalTopics,
      completedTopics,
      completionPercentage,
      testCount,
      averageTestScore,
      studyHours: subject.completedHours,
    };
  });

  const studyDates = [...new Set(studySessions.map((s) => s.date))];

  const showOnboarding = subjects.length === 0 && mockTests.length === 0 && studySessions.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <AuthModal />
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg text-muted-foreground mt-8">Loading...</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg text-muted-foreground mt-8">Please log in to access your tracker.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">GATE Exam Tracker</h1>
            </div>
            <SubjectManager
              onAddSubject={handleAddSubject}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              }
            />
          </div>

          {showOnboarding ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to GATE Exam Tracker!
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Start by adding subjects you're preparing for. Track your progress, log study time, and monitor your mock test scores all in one place.
                </p>
                <SubjectManager onAddSubject={handleAddSubject} />
              </CardContent>
            </Card>
          ) : (
            <>
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
                  <SubjectTracker
                    subjects={subjects}
                    onToggleTopic={handleToggleTopic}
                    onDeleteSubject={handleDeleteSubject}
                    onEditSubject={handleEditSubject}
                  />
                  {loadingSubjects && <div>Loading subjects...</div>}
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
