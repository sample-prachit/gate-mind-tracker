import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface SubjectTrackerProps {
  subjects: Subject[];
  onToggleTopic: (subjectId: string, topicId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const SubjectTracker = ({ subjects, onToggleTopic, onDeleteSubject }: SubjectTrackerProps) => {
  const getCompletionPercentage = (topics: Topic[]) => {
    const completed = topics.filter((t) => t.completed).length;
    return (completed / topics.length) * 100;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Subject-wise Topics</h2>
      
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center mb-4">
              No subjects added yet. Click "Add Subject" to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => {
            const completionPercentage = getCompletionPercentage(subject.topics);
            const completedCount = subject.topics.filter((t) => t.completed).length;

            return (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{subject.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={subject.color}>
                        {completedCount}/{subject.topics.length}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{subject.name}" and all its topics. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSubject(subject.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="mt-2" />
                </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subject.topics.map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${subject.id}-${topic.id}`}
                        checked={topic.completed}
                        onCheckedChange={() => onToggleTopic(subject.id, topic.id)}
                      />
                      <label
                        htmlFor={`${subject.id}-${topic.id}`}
                        className={`text-sm flex-1 cursor-pointer ${
                          topic.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {topic.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
