import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  Lightbulb,
  Settings,
} from "lucide-react";
// Removed "@/types" imports as we define them below for completeness
// import { Subject, ScheduledTask } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// --- Placeholder Type Definitions (as requested for "completeness") ---
// You would normally keep these in a separate file like `@/types.ts`

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

// Use the main TaskStatus union for compatibility with types/index.ts
export type TaskStatus = "not-started" | "in-progress" | "completed" | "overdue" | "pending";
export interface ScheduledTask {
  id: string;
  subjectName: string;
  topicNames: string[];
  startDate: string;
  endDate: string;
  targetHours: number;
  completedHours: number;
  status: TaskStatus;
}

// --- Prop Interface ---

interface AIPlannerAssistantProps {
  subjects: Subject[];
  scheduledTasks: ScheduledTask[];
}

// --- Local Interfaces for AI Response ---

interface StudyTask {
  subject: string;
  topic: string;
  duration: number; // Duration in hours
  timeSlot: string;
  priority: "high" | "medium" | "low";
}

interface DailyPlan {
  date: string; // The date string returned from the AI
  tasks: StudyTask[];
  tips: string[];
  motivation: string;
}

// --- React Component ---

export const AIPlannerAssistant = ({
  subjects,
  scheduledTasks,
}: AIPlannerAssistantProps) => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("gemini_api_key") || ""
  );
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [preferences, setPreferences] = useState({
    studyHoursPerDay: "6",
    preferredStartTime: "09:00",
    preferredEndTime: "21:00",
    breakDuration: "15",
    additionalNotes: "",
  });

  const saveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    setShowApiKeyDialog(false);
  };

  const generateDailyPlan = async () => {
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setLoading(true);
    setDailyPlan(null); // Clear previous plan
    try {
      // Prepare context for AI
      const context = {
        subjects: subjects.map((s) => ({
          name: s.name,
          topics: s.topics.map((t) => ({ name: t.name, completed: t.completed })),
          pendingTopics: s.topics.filter((t) => !t.completed).length,
        })),
        scheduledTasks: scheduledTasks.map((t) => ({
          subject: t.subjectName,
          topics: t.topicNames,
          deadline: t.endDate,
          status: t.status,
          targetHours: t.targetHours,
          completedHours: t.completedHours,
        })),
        preferences,
        currentDate: new Date().toISOString().split("T")[0], // Provide today's date
      };

      const prompt = `You are an AI study planner for GATE exam preparation. Based on the following information, create an optimized daily study plan for today (${context.currentDate}).

**Subjects and Topics:**
${context.subjects
  .map(
    (s) =>
      `- ${s.name}: ${s.pendingTopics} topics pending
  Topics: ${s.topics.map((t) => `${t.name} ${t.completed ? "(✓)" : "(pending)"}`).join(", ")}`
  )
  .join("\n")}

**Scheduled Tasks:**
${
  context.scheduledTasks.length > 0
    ? context.scheduledTasks
        .map(
          (t) =>
            `- ${t.subject}: ${t.topics.join(", ")} (Deadline: ${t.deadline}, Status: ${t.status}, Progress: ${t.completedHours}/${t.targetHours}h)`
        )
        .join("\n")
    : "No specific scheduled tasks."
}

**Study Preferences:**
- Total study hours per day: ${preferences.studyHoursPerDay} hours
- Preferred time: ${preferences.preferredStartTime} - ${preferences.preferredEndTime}
- Break duration: ${preferences.breakDuration} minutes
- Additional notes: ${preferences.additionalNotes || "None"}

IMPORTANT: Return ONLY valid JSON. Do NOT include any explanation, markdown, code block, or extra text. The response must be a single valid JSON object, nothing else. If you cannot answer, return an empty JSON object {}.

JSON format:
{
  "date": "${context.currentDate}",
  "tasks": [
    {
      "subject": "subject name",
      "topic": "specific topic to study",
      "duration": 1.5,
      "timeSlot": "09:00 - 10:30",
      "priority": "high"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "motivation": "motivational message"
}

Consider:
1. Prioritize tasks with approaching deadlines from 'Scheduled Tasks'.
2. Balance between different subjects.
3. Include breaks between study sessions (${preferences.breakDuration} min).
4. Focus on pending topics.
5. Allocate more time to high-priority subjects or tasks.
6. Keep sessions focused (e.g., 45-90 minutes per topic/session).
7. Ensure all 'timeSlot' entries fit between '${preferences.preferredStartTime}' and '${preferences.preferredEndTime}'.
8. The total 'duration' of all tasks should sum up to approximately ${preferences.studyHoursPerDay} hours.`;

      // *** CORRECTION: Use a valid, existing model name ***
      const model = "gemini-2.5-flash-lite"; // Changed from "gemini-2.5-flash"

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error: ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      // Log the full API response for debugging
      console.log("[Gemini full API response]", data);

      // Defensive: check structure before accessing deeply
      const text =
        data &&
        Array.isArray(data.candidates) &&
        data.candidates[0] &&
        data.candidates[0].content &&
        Array.isArray(data.candidates[0].content.parts) &&
        data.candidates[0].content.parts[0] &&
        typeof data.candidates[0].content.parts[0].text === "string"
          ? data.candidates[0].content.parts[0].text
          : null;

      if (!text) {
        alert(
          "AI response missing expected content.\n\nFull API response:\n" +
            JSON.stringify(data, null, 2)
        );
        throw new Error(
          "AI response missing expected content. See alert and console for full response."
        );
      }

      // Log raw AI response for debugging
      console.log("[Gemini raw response]", text);

      // The robust JSON parsing logic you had is excellent.
      // We keep it, as even with `responseMimeType`, it's good to have a fallback.
      let cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      let plan = null;
      let lastError = null;
      // Try direct parse first
      try {
        plan = JSON.parse(cleanedText);
      } catch (e) {
        lastError = e;
        // Try to find the largest valid JSON substring
        let braceStack = [];
        let startIdx = cleanedText.indexOf("{");
        let endIdx = -1;
        
        if (startIdx === -1) {
          throw new Error("No JSON object found in response.");
        }

        for (let i = startIdx; i < cleanedText.length; i++) {
          if (cleanedText[i] === "{") braceStack.push("{");
          if (cleanedText[i] === "}") {
            if (braceStack.length === 0) continue; // Malformed, ignore
            braceStack.pop();
          }
          if (braceStack.length === 0 && startIdx !== -1) {
            endIdx = i + 1;
            break;
          }
        }
        if (startIdx !== -1 && endIdx !== -1) {
          const possibleJson = cleanedText.slice(startIdx, endIdx);
          try {
            plan = JSON.parse(possibleJson);
          } catch (e2) {
            lastError = e2;
          }
        }
      }
      if (!plan || !plan.tasks) { // Added check for plan.tasks
        alert(
          "Failed to parse AI response as valid JSON plan. Please check the console for the raw response and try again.\n\nRaw response:\n" +
            text
        );
        throw new Error(
          "Failed to parse AI response as JSON. " +
            (lastError ? lastError.message : "")
        );
      }
      setDailyPlan(plan);
    } catch (error) {
      console.error("Error generating plan:", error);
      alert(
        "Failed to generate plan. Please check your API key, network connection, and console for errors."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Configuration Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Gemini API Key</DialogTitle>
            <DialogDescription>
              Enter your Google Gemini API key to enable AI-powered study
              planning. Get your free API key from{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google AI Studio
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApiKeyDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={saveApiKey} className="flex-1">
                Save API Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main AI Assistant Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Study Planner
              </CardTitle>
              <CardDescription>
                Get personalized daily study plans powered by Google Gemini AI
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              API Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Study Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Study Hours/Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={preferences.studyHoursPerDay}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      studyHoursPerDay: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Break Duration (min)</Label>
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={preferences.breakDuration}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      breakDuration: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={preferences.preferredStartTime}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      preferredStartTime: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={preferences.preferredEndTime}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      preferredEndTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={preferences.additionalNotes}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    additionalNotes: e.target.value,
                  })
                }
                placeholder="Any specific topics to focus on, exam dates, or other preferences..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={generateDailyPlan}
            disabled={loading || subjects.length === 0}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? "Generating Plan..." : "Generate Today's Study Plan"}
          </Button>

          {subjects.length === 0 && (
            <Alert>
              <AlertTitle>No Subjects Found</AlertTitle>
              <AlertDescription>
                Please add subjects first to generate a personalized study plan.
              </AlertDescription>
            </Alert>
          )}

          {/* Generated Plan Display */}
          {dailyPlan && (
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Today's Study Plan</h3>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {/* *** CORRECTION: Use the date from the AI response *** */}
                  {dailyPlan.date}
                </Badge>
              </div>

              {/* Study Tasks */}
              <div className="space-y-3">
                {dailyPlan.tasks.map((task, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{task.subject}</h4>
                            <Badge
                              variant="outline"
                              className={getPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {task.topic}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.timeSlot}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {task.duration}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Study Tips */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Study Tips
                </h4>
                <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground">
                  {dailyPlan.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Motivation */}
              <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <AlertTitle className="text-purple-900">
                  Daily Motivation
                </AlertTitle>
                <AlertDescription className="text-purple-800">
                  {dailyPlan.motivation}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};