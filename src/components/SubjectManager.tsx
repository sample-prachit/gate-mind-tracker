import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
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
  startDate: string;
  endDate: string;
  totalHours: number;
  completedHours: number;
  inProgressHours: number;
}

interface SubjectManagerProps {
  onAddSubject: (subject: Omit<Subject, "id">) => void;
  onEditSubject?: (subjectId: string, subject: Omit<Subject, "id">) => void;
  subject?: Subject;
  trigger?: React.ReactNode;
}

const COLORS = [
  { value: "bg-chart-1/10 text-chart-1", label: "Blue" },
  { value: "bg-chart-2/10 text-chart-2", label: "Green" },
  { value: "bg-chart-3/10 text-chart-3", label: "Orange" },
  { value: "bg-chart-4/10 text-chart-4", label: "Purple" },
  { value: "bg-chart-5/10 text-chart-5", label: "Red" },
];

export const SubjectManager = ({ onAddSubject, onEditSubject, subject, trigger }: SubjectManagerProps) => {
  const isEditMode = !!subject;
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState(subject?.name || "");
  const [selectedColor, setSelectedColor] = useState(subject?.color || COLORS[0].value);
  const [topics, setTopics] = useState<string[]>(subject?.topics.map(t => t.name) || []);
  const [currentTopic, setCurrentTopic] = useState("");
  const [startDate, setStartDate] = useState(subject?.startDate || "");
  const [endDate, setEndDate] = useState(subject?.endDate || "");

  // Update form when subject prop changes
  const resetForm = () => {
    if (subject) {
      setSubjectName(subject.name);
      setSelectedColor(subject.color);
      setTopics(subject.topics.map(t => t.name));
      setStartDate(subject.startDate);
      setEndDate(subject.endDate);
    } else {
      setSubjectName("");
      setSelectedColor(COLORS[0].value);
      setTopics([]);
      setStartDate("");
      setEndDate("");
    }
    setCurrentTopic("");
  };

  const handleAddTopic = () => {
    if (currentTopic.trim()) {
      setTopics([...topics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjectName.trim() && topics.length > 0 && startDate && endDate) {
      const subjectData: Omit<Subject, "id"> = {
        name: subjectName.trim(),
        color: selectedColor,
        topics: topics.map((topic, index) => ({
          id: subject?.topics[index]?.id || index.toString(),
          name: topic,
          completed: subject?.topics[index]?.completed || false,
        })),
        startDate,
        endDate,
        totalHours: subject?.totalHours || 0,
        completedHours: subject?.completedHours || 0,
        inProgressHours: subject?.inProgressHours || 0,
      };
      
      if (isEditMode && onEditSubject && subject) {
        onEditSubject(subject.id, subjectData);
      } else {
        onAddSubject(subjectData);
      }
      
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update subject details and topics"
              : "Create a subject and add topics you need to cover for GATE exam"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g., Data Structures, Operating Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`px-3 py-1.5 rounded-md border-2 transition-all ${color.value} ${
                    selectedColor === color.value
                      ? "border-foreground scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Add Topics</Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                placeholder="e.g., Arrays, Linked Lists"
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTopic} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {topics.length > 0 && (
            <div className="space-y-2">
              <Label>Topics ({topics.length})</Label>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="pl-3 pr-1">
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(index)}
                      className="ml-2 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!subjectName.trim() || topics.length === 0 || !startDate || !endDate}
              className="flex-1"
            >
              {isEditMode ? "Update Subject" : "Add Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
