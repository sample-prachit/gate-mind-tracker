import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, CheckCircle2, Circle, Download, AlertCircle } from "lucide-react";
import { ScheduledTask, TaskStatus, Subject, Topic } from "@/types";
import { addDays, format, parseISO, isBefore, isAfter, isToday } from "date-fns";

interface SchedulePlannerProps {
  subjects: Subject[];
  scheduledTasks: ScheduledTask[];
  onAddTask: (task: Omit<ScheduledTask, "id">) => void;
  onUpdateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const SchedulePlanner = ({
  subjects,
  scheduledTasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: SchedulePlannerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [period, setPeriod] = useState<"weekly" | "custom">("weekly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [targetHours, setTargetHours] = useState<string>("5");
  const [notes, setNotes] = useState<string>("");

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  const handlePeriodChange = (value: "weekly" | "custom") => {
    setPeriod(value);
    if (value === "weekly" && startDate) {
      const start = parseISO(startDate);
      setEndDate(format(addDays(start, 6), "yyyy-MM-dd"));
    }
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (period === "weekly") {
      const start = parseISO(date);
      setEndDate(format(addDays(start, 6), "yyyy-MM-dd"));
    }
  };

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSubject || selectedTopics.length === 0 || !startDate || !endDate) return;

    const topicNames = currentSubject.topics
      .filter((t) => selectedTopics.includes(t.id))
      .map((t) => t.name);

    const task: Omit<ScheduledTask, "id"> = {
      subjectId: selectedSubject,
      subjectName: currentSubject.name,
      topicIds: selectedTopics,
      topicNames,
      startDate,
      endDate,
      status: "not-started",
      targetHours: parseFloat(targetHours),
      completedHours: 0,
      notes,
      color: currentSubject.color,
    };

    onAddTask(task);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedSubject("");
    setSelectedTopics([]);
    setPeriod("weekly");
    setStartDate("");
    setEndDate("");
    setTargetHours("5");
    setNotes("");
  };

  const getTaskStatus = (task: ScheduledTask): TaskStatus => {
    // If status is completed, always show completed
    if (task.status === 'completed') return 'completed';
    const today = new Date();
    const start = parseISO(task.startDate);
    const end = parseISO(task.endDate);
    if (task.status && task.status !== 'not-started' && task.status !== 'in-progress' && task.status !== 'overdue') {
      return task.status;
    }
    if (today < start) return 'not-started';
    if (today > end) return 'overdue';
    return 'in-progress';
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-500" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const variants: Record<TaskStatus, string> = {
      completed: "bg-green-100 text-green-800 border-green-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      overdue: "bg-red-100 text-red-800 border-red-300",
      "not-started": "bg-gray-100 text-gray-800 border-gray-300",
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  const cycleTaskStatus = (task: ScheduledTask) => {
    const statusCycle: TaskStatus[] = ["not-started", "in-progress", "completed"];
    const currentIndex = statusCycle.indexOf(task.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    onUpdateTask(task.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Study Schedule Planner
              </CardTitle>
              <CardDescription className="mt-1">
                Subjects marked as "In Progress" are automatically synced here. Track progress and manage deadlines.
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Study Task</DialogTitle>
                  <DialogDescription>
                    Create a study schedule for specific topics
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
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

                  {currentSubject && (
                    <div className="space-y-2">
                      <Label>Topics to Cover</Label>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {currentSubject.topics.map((topic) => (
                          <Badge
                            key={topic.id}
                            variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleToggleTopic(topic.id)}
                          >
                            {topic.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Schedule Period</Label>
                    <Select value={period} onValueChange={handlePeriodChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                        <SelectItem value="custom">Custom Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        disabled={period === "weekly"}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Hours</Label>
                    <Input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={targetHours}
                      onChange={(e) => setTargetHours(e.target.value)}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional notes or goals..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!selectedSubject || selectedTopics.length === 0 || !startDate || !endDate}
                      className="flex-1"
                    >
                      Create Schedule
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {scheduledTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled tasks yet. Create your first study schedule!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledTasks
                .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
                .map((task) => {
                  const actualStatus = getTaskStatus(task);
                  const progress = (task.completedHours / task.targetHours) * 100;

                  return (
                    <Card key={task.id} className="border-l-4" style={{ borderLeftColor: task.color.includes('bg-') ? undefined : task.color }}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-lg">{task.subjectName}</h3>
                              {getStatusBadge(actualStatus)}
                            </div>
                            <p className="text-sm text-muted-foreground break-words">
                              Topics: {task.topicNames.join(", ")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                              <span className="text-xs sm:text-sm">
                                📅 {format(parseISO(task.startDate), "MMM dd")} -{" "}
                                {format(parseISO(task.endDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                            {/* Notes removed for cleaner look */}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cycleTaskStatus(task)}
                              title="Change status"
                              className="flex-1 sm:flex-none"
                            >
                              {getStatusIcon(actualStatus)}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDeleteTask(task.id)}
                              className="flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
