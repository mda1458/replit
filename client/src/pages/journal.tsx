import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/NavigationHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Save, Edit3 } from "lucide-react";

export default function Journal() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedStep, setSelectedStep] = useState<string>("all");
  const [newEntry, setNewEntry] = useState("");
  const [newEntryStep, setNewEntryStep] = useState<string>("1");
  const [newEntryPrompt, setNewEntryPrompt] = useState("");
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editingContent, setEditingContent] = useState("");

  // Fetch journal entries
  const { data: entries, isLoading } = useQuery({
    queryKey: ["/api/journal/entries", selectedStep === "all" ? "" : selectedStep],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Fetch RELEASE steps
  const { data: releaseSteps } = useQuery({
    queryKey: ["/api/release/steps"],
  });

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: { stepNumber: number; prompt: string; content: string }) => {
      await apiRequest("POST", "/api/journal/entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      setNewEntry("");
      setNewEntryPrompt("");
      toast({
        title: "Success",
        description: "Journal entry saved successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update journal entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async (data: { id: number; content: string }) => {
      await apiRequest("PATCH", `/api/journal/entries/${data.id}`, { content: data.content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal/entries"] });
      setEditingEntry(null);
      setEditingContent("");
      toast({
        title: "Success",
        description: "Journal entry updated successfully!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveEntry = () => {
    if (!newEntry.trim() || !newEntryPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both the prompt and your reflection.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate({
      stepNumber: parseInt(newEntryStep),
      prompt: newEntryPrompt,
      content: newEntry,
    });
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setEditingContent(entry.content);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) {
      toast({
        title: "Error",
        description: "Entry content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    updateEntryMutation.mutate({
      id: editingEntry.id,
      content: editingContent,
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditingContent("");
  };

  const journalPrompts = [
    "What emotions am I feeling right now about this situation?",
    "How has holding onto this hurt affected my daily life?",
    "What would I say to someone else in my situation?",
    "What positive changes could come from letting this go?",
    "How do I want to feel about this situation in the future?",
  ];

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
        <NavigationHeader />
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
      <NavigationHeader />

      {/* Header */}
      <section className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Journal</h1>
        </div>
        <p className="text-gray-600">Reflect on your forgiveness journey</p>
      </section>

      {/* New Entry Form */}
      <section className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">New Entry</h2>
        
        <Card className="journal-card">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step
                </label>
                <Select value={newEntryStep} onValueChange={setNewEntryStep}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {releaseSteps?.map((step: any) => (
                      <SelectItem key={step.id} value={step.id.toString()}>
                        {step.id}. {step.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quick Prompt
                </label>
                <Select value={newEntryPrompt} onValueChange={setNewEntryPrompt}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {journalPrompts.map((prompt, index) => (
                      <SelectItem key={index} value={prompt}>
                        {prompt.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reflection
              </label>
              <Textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write about your thoughts and feelings..."
                className="h-32 resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Take your time</span>
              </div>
              <Button 
                onClick={handleSaveEntry}
                disabled={createEntryMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Filter */}
      <section className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by step:</label>
          <Select value={selectedStep} onValueChange={setSelectedStep}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Steps</SelectItem>
              {releaseSteps?.map((step: any) => (
                <SelectItem key={step.id} value={step.id.toString()}>
                  {step.id}. {step.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Journal Entries */}
      <section className="p-6 pb-24">
        <h2 className="text-lg font-semibold mb-4">Your Entries</h2>
        
        {!entries || entries.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No entries yet</h3>
              <p className="text-gray-500">Start writing your first journal entry above to begin your reflection journey.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <Card key={entry.id} className="journal-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{entry.stepNumber}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          Step {entry.stepNumber}: {releaseSteps?.find((s: any) => s.id === entry.stepNumber)?.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {editingEntry?.id !== entry.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                        className="text-xs"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                    <p className="text-sm text-gray-600 italic">{entry.prompt}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reflection:</p>
                    {editingEntry?.id === entry.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="h-32 resize-none text-sm"
                        />
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateEntryMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {updateEntryMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updateEntryMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800">{entry.content}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <BottomNavigation />
    </div>
  );
}
