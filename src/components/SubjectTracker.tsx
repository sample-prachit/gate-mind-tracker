import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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
}

export const SubjectTracker = ({ subjects, onToggleTopic }: SubjectTrackerProps) => {
  const getCompletionPercentage = (topics: Topic[]) => {
    const completed = topics.filter((t) => t.completed).length;
    return (completed / topics.length) * 100;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Subject-wise Topics</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => {
          const completionPercentage = getCompletionPercentage(subject.topics);
          const completedCount = subject.topics.filter((t) => t.completed).length;

          return (
            <Card key={subject.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <Badge variant="secondary" className={subject.color}>
                    {completedCount}/{subject.topics.length}
                  </Badge>
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
    </div>
  );
};
