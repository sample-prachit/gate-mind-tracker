import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduledTask, TaskStatus } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths, isWithinInterval, isSameDay, isBefore } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TaskCalendarProps {
  scheduledTasks: ScheduledTask[];
  onUpdateTask: (taskId: string, updates: Partial<ScheduledTask>) => void;
}

export const TaskCalendar = ({ scheduledTasks, onUpdateTask }: TaskCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<ScheduledTask[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = monthStart.getDay();

  const getTasksForDate = (date: Date): ScheduledTask[] => {
    return scheduledTasks.filter((task) => {
      const taskStart = parseISO(task.startDate);
      const taskEnd = parseISO(task.endDate);
      return isWithinInterval(date, { start: taskStart, end: taskEnd });
    });
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

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleDateClick = (date: Date) => {
    const tasks = getTasksForDate(date);
    if (tasks.length > 0) {
      setSelectedDate(date);
      setSelectedTasks(tasks);
      setDialogOpen(true);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const cycleTaskStatus = (task: ScheduledTask) => {
    const statusCycle: TaskStatus[] = ["not-started", "in-progress", "completed"];
    const currentIndex = statusCycle.indexOf(task.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    onUpdateTask(task.id, { status: nextStatus });
    
    // Update local state
    setSelectedTasks(selectedTasks.map(t => 
      t.id === task.id ? { ...t, status: nextStatus } : t
    ));
  };

  const toggleDayCompletion = (task: ScheduledTask, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const current = (task.dailyLog?.[dateKey] as ('done'|'pending') | undefined) || 'pending';
    const nextStatus: 'done' | 'pending' = current === 'done' ? 'pending' : 'done';
    const updatedLog: Record<string, 'done' | 'pending'> = { ...(task.dailyLog || {}), [dateKey]: nextStatus };
    onUpdateTask(task.id, { dailyLog: updatedLog });

    // Update local modal state if open
    setSelectedTasks(prev => prev.map(t => t.id === task.id ? { ...t, dailyLog: updatedLog } as ScheduledTask : t));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Task Calendar
              </CardTitle>
              <CardDescription>
                Visual overview of your scheduled study tasks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2"></div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const tasks = getTasksForDate(day);
                const hasTasksToday = tasks.length > 0;
                const dayIsToday = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                      ${dayIsToday ? "border-primary border-2" : "border-border"}
                      ${hasTasksToday ? "hover:shadow-md hover:border-primary" : "hover:bg-muted"}
                      ${!isSameMonth(day, currentMonth) ? "opacity-50" : ""}
                    `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {tasks.slice(0, 3).map((task) => {
                        const status = getTaskStatus(task);
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const isDone = task.dailyLog && task.dailyLog[dateKey] === 'done';
                        return (
                          <div
                            key={task.id}
                            className={`
                              text-xs px-1.5 py-0.5 rounded truncate
                              ${isDone ? 'bg-green-500' : getStatusColor(status)} text-white
                            `}
                            title={`${task.subjectName} - ${status}${isDone ? ' (done for this day)' : ''}`}
                          >
                            {task.subjectName}
                          </div>
                        );
                      })}
                      {tasks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{tasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Tasks for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              Tap a task to toggle done/pending for this date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedTasks.map((task) => {
              const status = getTaskStatus(task);
              const progress = (task.completedHours / task.targetHours) * 100;
              const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
              const dayState = (task.dailyLog?.[dateKey] as ('done'|'pending') | undefined) || 'pending';

              return (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectedDate && toggleDayCompletion(task, selectedDate)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{task.subjectName}</h4>
                        <Badge
                          className={`${getStatusColor(status)} text-white border-0`}
                        >
                          {status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.topicNames.join(", ")}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {format(parseISO(task.startDate), "MMM dd")} -{" "}
                          {format(parseISO(task.endDate), "MMM dd")}
                        </span>
                      </div>
                      {selectedDate && (
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            {dayState === 'done' ? 'Marked done for this day' : 'Pending for this day'}
                          </span>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleDayCompletion(task, selectedDate); }}>
                            {dayState === 'done' ? 'Mark Pending' : 'Mark Done'}
                          </Button>
                        </div>
                      )}
                      {task.notes && (
                        <p className="text-sm text-muted-foreground italic border-l-2 pl-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
