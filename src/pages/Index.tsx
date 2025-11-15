import { useState, useEffect } from "react";
import { fetchUserData, saveUserData } from "@/lib/progressApi";
import { useSupabaseAuth } from "@/hooks/AuthProvider";
import { AuthModal } from "@/components/AuthModal";
import { Dashboard } from "@/components/Dashboard";
import { SubjectTracker } from "@/components/SubjectTracker";
import { TestTracker, TestType } from "@/components/TestTracker";
import { StudyTimeLogger } from "@/components/StudyTimeLogger";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";
import { StreakCalendar } from "@/components/StreakCalendar";
import { SubjectManager } from "@/components/SubjectManager";
import { SchedulePlanner } from "@/components/SchedulePlanner";
import { TaskCalendar } from "@/components/TaskCalendar";
import { AIPlannerAssistant } from "@/components/AIPlannerAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduledTask, TaskStatus, StudyFrequency } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
  status?: TaskStatus;
  frequency?: StudyFrequency;
  customDays?: number[];
  autoAddToCalendar?: boolean;
}

interface Test {
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

interface StudySession {
  id: string;
  date: string;
  hours: number;
}

const Index = () => {
  const { user, loading } = useSupabaseAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsRecordId, setSubjectsRecordId] = useState<string | undefined>(undefined);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [mockTests, setMockTests] = useState<Test[]>([]);
  const [mockTestsRecordId, setMockTestsRecordId] = useState<string | undefined>(undefined);
  const [loadingMockTests, setLoadingMockTests] = useState(true);

  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studySessionsRecordId, setStudySessionsRecordId] = useState<string | undefined>(undefined);
  const [loadingStudySessions, setLoadingStudySessions] = useState(true);

  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [scheduledTasksRecordId, setScheduledTasksRecordId] = useState<string | undefined>(undefined);
  const [loadingScheduledTasks, setLoadingScheduledTasks] = useState(true);



  // Fetch subjects from Supabase on mount or when user changes
  useEffect(() => {
    if (!user) return;
    const loadSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const data = await fetchUserData(user.id, "subjects");
        if (data && data.length > 0) {
          setSubjects(data[0].progress.subjects || []);
          setSubjectsRecordId(data[0].id);
        } else {
          setSubjects([]);
          setSubjectsRecordId(undefined);
        }
      } catch (e) {
        console.error('Error loading subjects:', e);
      }
      setLoadingSubjects(false);
    };
    loadSubjects();
  }, [user]);

  // Fetch mock tests from Supabase
  useEffect(() => {
    if (!user) return;
    const loadMockTests = async () => {
      setLoadingMockTests(true);
      try {
        const data = await fetchUserData(user.id, "mock_tests");
        if (data && data.length > 0) {
          setMockTests(data[0].progress.mock_tests || []);
          setMockTestsRecordId(data[0].id);
        } else {
          setMockTests([]);
          setMockTestsRecordId(undefined);
        }
      } catch (e) {
        console.error('Error loading mock tests:', e);
      }
      setLoadingMockTests(false);
    };
    loadMockTests();
  }, [user]);

  // Fetch study sessions from Supabase
  useEffect(() => {
    if (!user) return;
    const loadStudySessions = async () => {
      setLoadingStudySessions(true);
      try {
        const data = await fetchUserData(user.id, "study_sessions");
        if (data && data.length > 0) {
          setStudySessions(data[0].progress.study_sessions || []);
          setStudySessionsRecordId(data[0].id);
        } else {
          setStudySessions([]);
          setStudySessionsRecordId(undefined);
        }
      } catch (e) {
        console.error('Error loading study sessions:', e);
      }
      setLoadingStudySessions(false);
    };
    loadStudySessions();
  }, [user]);

  // Fetch scheduled tasks from Supabase
  useEffect(() => {
    if (!user) return;
    const loadScheduledTasks = async () => {
      setLoadingScheduledTasks(true);
      try {
        const data = await fetchUserData(user.id, "scheduled_tasks");
        if (data && data.length > 0) {
          setScheduledTasks(data[0].progress.scheduled_tasks || []);
          setScheduledTasksRecordId(data[0].id);
        } else {
          setScheduledTasks([]);
          setScheduledTasksRecordId(undefined);
        }
      } catch (e) {
        console.error('Error loading scheduled tasks:', e);
      }
      setLoadingScheduledTasks(false);
    };
    loadScheduledTasks();
  }, [user]);

  // Auto-sync in-progress subjects to calendar
  useEffect(() => {
    if (!user || loadingSubjects || loadingScheduledTasks) return;
    
    const today = new Date();
    subjects.forEach((subject) => {
      // Only auto-add if status is in-progress and autoAddToCalendar is true
      if (subject.status !== "in-progress" || !subject.autoAddToCalendar) return;
      
      // Check if already in scheduled tasks
      const alreadyScheduled = scheduledTasks.some(task => task.subjectId === subject.id);
      if (alreadyScheduled) return;
      
      // Get pending topics
      const pendingTopics = subject.topics.filter(t => !t.completed);
      if (pendingTopics.length === 0) return;
      
      // Build frequency note
      let frequencyNote = "";
      if (subject.frequency === "everyday") {
        frequencyNote = "Everyday";
      } else if (subject.frequency === "weekdays") {
        frequencyNote = "Weekdays (Mon-Fri)";
      } else if (subject.frequency === "custom" && subject.customDays) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        frequencyNote = `Custom: ${subject.customDays.map(d => dayNames[d]).join(", ")}`;
      }
      
      const newTask: ScheduledTask = {
        id: Date.now().toString() + subject.id,
        subjectId: subject.id,
        subjectName: subject.name,
        topicIds: pendingTopics.map(t => t.id),
        topicNames: pendingTopics.map(t => t.name),
        startDate: subject.startDate,
        endDate: subject.endDate,
        status: "in-progress",
        targetHours: Math.max(pendingTopics.length * 2, 5),
        completedHours: subject.completedHours || 0,
        notes: `Auto-synced: ${pendingTopics.length} pending topics | ${frequencyNote}`,
        color: subject.color,
      };
      
      setScheduledTasks(prev => {
        const updated = [...prev, newTask];
        persistScheduledTasks(updated);
        return updated;
      });
    });
  }, [subjects, user, loadingSubjects, loadingScheduledTasks]);

  // Save subjects to Supabase
  const persistSubjects = async (subjectsToSave: Subject[]) => {
    if (!user) return;
    try {
      const result = await saveUserData(
        user.id,
        "subjects",
        subjectsToSave,
        subjectsRecordId
      );
      // If we just inserted, update record ID with the new row's id
      if (!subjectsRecordId && result && result.data && result.data[0]?.id) {
        setSubjectsRecordId(result.data[0].id);
      }
    } catch (e) {
      console.error('Error persisting subjects:', e);
    }
  };

  // Save mock tests to Supabase
  const persistMockTests = async (testsToSave: Test[]) => {
    if (!user) return;
    try {
      const result = await saveUserData(
        user.id,
        "mock_tests",
        testsToSave,
        mockTestsRecordId
      );
      if (!mockTestsRecordId && result && result.data && result.data[0]?.id) {
        setMockTestsRecordId(result.data[0].id);
      }
    } catch (e) {
      console.error('Error persisting mock tests:', e);
    }
  };

  // Save study sessions to Supabase
  const persistStudySessions = async (sessionsToSave: StudySession[]) => {
    if (!user) return;
    try {
      const result = await saveUserData(
        user.id,
        "study_sessions",
        sessionsToSave,
        studySessionsRecordId
      );
      if (!studySessionsRecordId && result && result.data && result.data[0]?.id) {
        setStudySessionsRecordId(result.data[0].id);
      }
    } catch (e) {
      console.error('Error persisting study sessions:', e);
    }
  };

  // Save scheduled tasks to Supabase
  const persistScheduledTasks = async (tasksToSave: ScheduledTask[]) => {
    if (!user) return;
    try {
      const result = await saveUserData(
        user.id,
        "scheduled_tasks",
        tasksToSave,
        scheduledTasksRecordId
      );
      if (!scheduledTasksRecordId && result && result.data && result.data[0]?.id) {
        setScheduledTasksRecordId(result.data[0].id);
      }
    } catch (e) {
      console.error('Error persisting scheduled tasks:', e);
    }
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
    // Also remove any scheduled task for this subject
    setScheduledTasks((prev) => {
      const updated = prev.filter((task) => task.subjectId !== subjectId);
      persistScheduledTasks(updated);
      return updated;
    });
  };

  const handleEditSubject = async (subjectId: string, subjectData: Omit<Subject, "id">) => {
    setSubjects((prev) => {
      const updated = prev.map((subject) =>
        subject.id === subjectId
          ? { ...subjectData, id: subject.id }
          : subject
      );
      persistSubjects(updated);
      return updated;
    });
    
    // Update corresponding calendar task if it exists
    const updatedSubject = { ...subjectData, id: subjectId };
    const correspondingTask = scheduledTasks.find(task => task.subjectId === subjectId);
    
    if (correspondingTask) {
      // If subject is no longer in-progress or auto-add is disabled, remove from calendar
      if (updatedSubject.status !== "in-progress" || !updatedSubject.autoAddToCalendar) {
        handleDeleteScheduledTask(correspondingTask.id);
        return;
      }
      
      // Update the task with new subject data
      const pendingTopics = updatedSubject.topics.filter(t => !t.completed);
      
      if (pendingTopics.length === 0) {
        // No pending topics, remove from calendar
        handleDeleteScheduledTask(correspondingTask.id);
        return;
      }
      
      // Build frequency note
      let frequencyNote = "";
      if (updatedSubject.frequency === "everyday") {
        frequencyNote = "Everyday";
      } else if (updatedSubject.frequency === "weekdays") {
        frequencyNote = "Weekdays (Mon-Fri)";
      } else if (updatedSubject.frequency === "custom" && updatedSubject.customDays) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        frequencyNote = `Custom: ${updatedSubject.customDays.map(d => dayNames[d]).join(", ")}`;
      }
      
      const taskUpdates: Partial<ScheduledTask> = {
        subjectName: updatedSubject.name,
        topicIds: pendingTopics.map(t => t.id),
        topicNames: pendingTopics.map(t => t.name),
        startDate: updatedSubject.startDate,
        endDate: updatedSubject.endDate,
        targetHours: Math.max(pendingTopics.length * 2, 5),
        completedHours: updatedSubject.completedHours || 0,
        notes: `Auto-synced: ${pendingTopics.length} pending topics | ${frequencyNote}`,
        color: updatedSubject.color,
      };
      
      handleUpdateScheduledTask(correspondingTask.id, taskUpdates);
    } else if (updatedSubject.status === "in-progress" && updatedSubject.autoAddToCalendar) {
      // Subject is now in-progress but not in calendar, add it
      const pendingTopics = updatedSubject.topics.filter(t => !t.completed);
      if (pendingTopics.length > 0) {
        let frequencyNote = "";
        if (updatedSubject.frequency === "everyday") {
          frequencyNote = "Everyday";
        } else if (updatedSubject.frequency === "weekdays") {
          frequencyNote = "Weekdays (Mon-Fri)";
        } else if (updatedSubject.frequency === "custom" && updatedSubject.customDays) {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          frequencyNote = `Custom: ${updatedSubject.customDays.map(d => dayNames[d]).join(", ")}`;
        }
        
        const newTask: Omit<ScheduledTask, "id"> = {
          subjectId: updatedSubject.id,
          subjectName: updatedSubject.name,
          topicIds: pendingTopics.map(t => t.id),
          topicNames: pendingTopics.map(t => t.name),
          startDate: updatedSubject.startDate,
          endDate: updatedSubject.endDate,
          status: "in-progress",
          targetHours: Math.max(pendingTopics.length * 2, 5),
          completedHours: updatedSubject.completedHours || 0,
          notes: `Auto-synced: ${pendingTopics.length} pending topics | ${frequencyNote}`,
          color: updatedSubject.color,
        };
        
        handleAddScheduledTask(newTask);
      }
    }
  };

  const handleToggleTopic = async (subjectId: string, topicId: string) => {
    setSubjects((prev) => {
      const updatedSubjects = prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              topics: subject.topics.map((topic) =>
                topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
              ),
            }
          : subject
      );
      persistSubjects(updatedSubjects);

      // Also update scheduled tasks for this subject to reflect pending topics
      const updatedSubject = updatedSubjects.find((s) => s.id === subjectId);
      if (updatedSubject) {
        const pendingTopics = updatedSubject.topics.filter((t) => !t.completed);

        setScheduledTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((t) => t.subjectId === subjectId);
          if (taskIndex === -1) return prevTasks; // no linked task

          const task = prevTasks[taskIndex];

          // If no pending topics left, mark task completed
          if (pendingTopics.length === 0) {
            const next = prevTasks.map((t, i) =>
              i === taskIndex
                ? { ...t, topicIds: [], topicNames: [], status: 'completed' as TaskStatus, targetHours: 0 }
                : t
            );
            persistScheduledTasks(next);
            return next;
          }

          // Otherwise, keep only pending topics in the task
          const next = prevTasks.map((t, i) =>
            i === taskIndex
              ? {
                  ...t,
                  topicIds: pendingTopics.map((pt) => pt.id),
                  topicNames: pendingTopics.map((pt) => pt.name),
                  targetHours: Math.max(pendingTopics.length * 2, 5),
                }
              : t
          );
          persistScheduledTasks(next);
          return next;
        });
      }

      return updatedSubjects;
    });
  };

  const handleAddTest = (score: number, totalMarks: number, testType: TestType, subjectId?: string, subjectName?: string, unitId?: string, unitName?: string) => {
    const newTest: Test = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      score,
      totalMarks,
      testType,
      subjectId,
      subjectName,
      unitId,
      unitName,
    };
    setMockTests((prev) => {
      const updated = [...prev, newTest];
      persistMockTests(updated);
      return updated;
    });
  };

  const handleAddStudySession = (hours: number) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      hours,
    };
    setStudySessions((prev) => {
      const updated = [...prev, newSession];
      persistStudySessions(updated);
      return updated;
    });
    toast({
      title: "Study session logged!",
      description: `Added ${hours} ${hours === 1 ? 'hour' : 'hours'} to your study log.`,
    });
  };

  const handleDeleteTest = (testId: string) => {
    setMockTests((prev) => {
      const updated = prev.filter(test => test.id !== testId);
      persistMockTests(updated);
      return updated;
    });
  };

  const handleAddScheduledTask = (taskData: Omit<ScheduledTask, "id">) => {
    const newTask: ScheduledTask = {
      ...taskData,
      id: Date.now().toString(),
    };
    setScheduledTasks((prev) => {
      const updated = [...prev, newTask];
      persistScheduledTasks(updated);
      return updated;
    });
  };

  const handleUpdateScheduledTask = (taskId: string, updates: Partial<ScheduledTask>) => {
    setScheduledTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      persistScheduledTasks(updated);
      return updated;
    });
  };

  const handleDeleteScheduledTask = (taskId: string) => {
    setScheduledTasks((prev) => {
      const updated = prev.filter((task) => task.id !== taskId);
      persistScheduledTasks(updated);
      return updated;
    });
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
      ? Number(
          (
            mockTests.reduce((sum, test) => sum + (test.score / test.totalMarks) * 100, 0) /
            mockTests.length
          ).toFixed(2)
        )
      : 0;
  const thisWeekHours = studySessions.reduce((sum, session) => sum + session.hours, 0);
  const studyStreak = calculateStreak();

  // Calculate real subject performance analytics
  const subjectPerformance = subjects.map((subject) => {
    // Get tests for this subject
    const subjectTests = mockTests.filter(
      test => test.subjectId === subject.id || 
      (test.testType === 'subject' && test.subjectId === subject.id) ||
      (test.testType === 'unit' && test.subjectId === subject.id)
    );
    
    // Calculate average test score for this subject
    const averageTestScore = subjectTests.length > 0
      ? Number(
          (
            subjectTests.reduce((sum, test) => sum + (test.score / test.totalMarks) * 100, 0) /
            subjectTests.length
          ).toFixed(2)
        )
      : 0;
    
    // Calculate completion percentage
    const completedTopics = subject.topics.filter(t => t.completed).length;
    const completionPercentage = subject.topics.length > 0
      ? (completedTopics / subject.topics.length) * 100
      : 0;
    
    // Get study hours for this subject from study sessions
    // Since we don't track subject-specific study sessions, we'll calculate based on overall time
    const subjectStudyHours = 0; // Will be 0 until we add subject-specific study logging
    
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalTopics: subject.topics.length,
      completedTopics: completedTopics,
      completionPercentage: completionPercentage,
      testCount: subjectTests.length,
      averageTestScore: averageTestScore,
      studyHours: subjectStudyHours,
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
                  Start by adding subjects you're preparing for. Track your progress, log study time, and monitor your test scores all in one place.
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
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="subjects">Subjects</TabsTrigger>
                  <TabsTrigger value="planning">Planning</TabsTrigger>
                  <TabsTrigger value="tests">Tests</TabsTrigger>
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

                <TabsContent value="planning">
                  <div className="space-y-6">
                    <SchedulePlanner
                      subjects={subjects}
                      scheduledTasks={scheduledTasks}
                      onAddTask={handleAddScheduledTask}
                      onUpdateTask={handleUpdateScheduledTask}
                      onDeleteTask={handleDeleteScheduledTask}
                    />
                    <TaskCalendar
                      scheduledTasks={scheduledTasks}
                      onUpdateTask={handleUpdateScheduledTask}
                    />
                    <AIPlannerAssistant
                      subjects={subjects}
                      scheduledTasks={scheduledTasks}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="tests">
                  <TestTracker 
                    tests={mockTests} 
                    subjects={subjects} 
                    onAddTest={handleAddTest}
                    onDeleteTest={handleDeleteTest}
                  />
                </TabsContent>

                <TabsContent value="study">
                  <StudyTimeLogger
                    studySessions={studySessions}
                    onAddSession={handleAddStudySession}
                  />
                </TabsContent>

                <TabsContent value="analytics">
                  <PerformanceAnalytics 
                    subjectPerformance={subjectPerformance}
                  />
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
