"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Zap, Clock, Sparkles, ArrowRight, Save } from "lucide-react"
import WorkflowPreview from "@/components/workflow-preview"
import { toast } from "sonner"

// Define interfaces for the fetched data
interface ApiItem {
  id: number | string; // ID can be number or string from API
  name: string;
  description?: string;
}

// Expected AI response structure for a single workflow suggestion
interface AISuggestedWorkflow {
  workflow_name: string;
  workflow_description: string;
  trigger_name: string;
  action_name: string;
  rule_type: "immediate" | "scheduled";
  delay_time: number | null;
  delay_unit: "minutes" | "hours" | "days" | null;
}

// Interface for the workflow object returned by the backend (serialized WorkflowRule)
interface BackendWorkflowRule {
  id: number | string;
  name: string;
  description?: string;
  trigger: ApiItem; // Expecting the full trigger object as per ApiItem interface
  action: ApiItem;  // Expecting the full action object as per ApiItem interface
  rule_type: "immediate" | "scheduled";
  delay_time?: number | null;
  delay_unit?: "minutes" | "hours" | "days" | null;
  is_active: boolean;
  // created_at and updated_at might also be present if your serializer includes them
}

// --- New Interfaces for AI Preview Feature ---
// Interface for the AI's direct suggestion
interface AISuggestion {
  workflow_name?: string;
  workflow_description?: string;
  trigger_name?: string;
  action_name?: string;
  rule_type?: "immediate" | "scheduled";
  delay_time?: number | string | null; // AI might send string
  delay_unit?: "minutes" | "hours" | "days" | null;
}

// Interface for the mapped suggestion data prepared by the backend
interface MappedSuggestion {
  workflow_name: string;
  workflow_description: string;
  rule_type: "immediate" | "scheduled" | null; // Can be null if AI's type was invalid
  delay_time: number | null;
  delay_unit: "minutes" | "hours" | "days" | null;
  trigger_id: number | null;
  trigger_name: string | null; // Name from DB if found
  action_id: number | null;
  action_name: string | null; // Name from DB if found
  is_active: boolean;
}

// Interface for a single preview item in the list from the backend
interface AIPreviewWorkflow {
  original_ai_suggestion: AISuggestion;
  mapped_suggestion: MappedSuggestion;
  mapping_notes: string[];
}

// For global errors reported by AI
interface AIGlobalError {
  [key: string]: any; // Flexible for now, adjust if AI provides a more structured error object
}
// --- End New Interfaces ---

export default function CreateWorkflow() {
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("ai")
  const [workflowType, setWorkflowType] = useState("immediate")
  const [isActive, setIsActive] = useState(true)

  // State for fetched triggers and actions
  const [dbTriggers, setDbTriggers] = useState<ApiItem[]>([])
  const [dbActions, setDbActions] = useState<ApiItem[]>([])
  // Optional: loading and error states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  // Manual configuration state
  const [selectedTrigger, setSelectedTrigger] = useState<string>("")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [delayTime, setDelayTime] = useState("15")
  const [delayUnit, setDelayUnit] = useState("minutes")

  // --- New State Variables for AI Preview Feature ---
  const [aiPreviewSuggestions, setAiPreviewSuggestions] = useState<AIPreviewWorkflow[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const [currentMappingNotes, setCurrentMappingNotes] = useState<string[]>([]);
  const [aiGlobalErrors, setAiGlobalErrors] = useState<AIGlobalError[]>([]);
  // --- End New State Variables ---

  // Helper function to populate the manual form with a selected AI suggestion
  const populateFormWithSuggestion = (preview: AIPreviewWorkflow | null, index: number | null) => {
    if (preview) {
      const suggestion = preview.mapped_suggestion;
      setWorkflowName(suggestion.workflow_name || "");
      setWorkflowDescription(suggestion.workflow_description || "");
      setSelectedTrigger(suggestion.trigger_id?.toString() || "");
      setSelectedAction(suggestion.action_id?.toString() || "");
      setWorkflowType(suggestion.rule_type || "immediate");
      setDelayTime(suggestion.delay_time?.toString() || "15");
      setDelayUnit(suggestion.delay_unit || "minutes");
      setIsActive(suggestion.is_active);
      setCurrentMappingNotes(preview.mapping_notes || []);
      setSelectedPreviewIndex(index);
      setActiveTab("manual"); // Switch to manual tab for review
    } else {
      // Clear the form if null is passed (e.g., no suggestion selected)
      setWorkflowName("");
      setWorkflowDescription("");
      setSelectedTrigger("");
      setSelectedAction("");
      setWorkflowType("immediate");
      setDelayTime("15");
      setDelayUnit("minutes");
      setIsActive(true);
      setCurrentMappingNotes([]);
      setSelectedPreviewIndex(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setErrorData(null);
      try {
        const [triggersResponse, actionsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/triggers/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/actions/`)
        ]);

        if (!triggersResponse.ok || !actionsResponse.ok) {
          let errorMsg = "Failed to fetch data:";
          if (!triggersResponse.ok) errorMsg += ` Triggers status: ${triggersResponse.status}`;
          if (!actionsResponse.ok) errorMsg += ` Actions status: ${actionsResponse.status}`;
          throw new Error(errorMsg);
        }

        const triggersData = await triggersResponse.json();
        const actionsData = await actionsResponse.json();

        setDbTriggers(triggersData);
        setDbActions(actionsData);

      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorData(error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleGenerateWorkflow = async () => {
    setIsGenerating(true);
    // Clear previous results
    setAiPreviewSuggestions([]);
    populateFormWithSuggestion(null, null); // Clear form and selections
    setAiGlobalErrors([]); // Still clear global errors here

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rules/generate-from-ai/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `AI generation failed with status: ${response.status}`;
        toast.error(errorMessage);
        setAiGlobalErrors(responseData?.ai_reported_errors || [{ message: errorMessage}]); // Store global errors if any
        setIsGenerating(false);
        return;
      }
      
      const previewWorkflows: AIPreviewWorkflow[] = responseData.preview_workflows || [];
      const globalErrors: AIGlobalError[] = responseData.ai_reported_errors || [];
      const backendMessage: string = responseData.message || "";

      setAiPreviewSuggestions(previewWorkflows);
      setAiGlobalErrors(globalErrors);

      if (backendMessage) {
        toast.info(backendMessage); // Display overall message from backend
      }

      if (globalErrors.length > 0) {
        const firstGlobalErrorMsg = globalErrors[0]?.issues?.join(', ') || JSON.stringify(globalErrors[0]);
        toast.warning(`AI reported global issues: ${firstGlobalErrorMsg}`);
      }

      if (previewWorkflows.length > 0) {
        if (previewWorkflows.length === 1) {
          // If only one suggestion, load it directly
          populateFormWithSuggestion(previewWorkflows[0], 0);
          toast.success(`AI suggested 1 workflow. Review and save manually.`);
        } else {
          // Multiple suggestions: user will pick from a list (UI to be added)
          toast.success(`AI suggested ${previewWorkflows.length} workflows. Please select one to load and review.`);
          // setActiveTab("ai"); // Keep user on AI tab to see the list
        }
      } else if (globalErrors.length === 0) {
        toast.info("AI did not suggest any workflows based on your prompt. Try rephrasing.");
      }

    } catch (error) {
      toast.error("An error occurred connecting to the AI service. Please check your connection.");
      console.error("Error in handleGenerateWorkflow (fetch/network):", error instanceof Error ? error.message : String(error));
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSaveWorkflow = async () => {
    if (!workflowName || !selectedTrigger || !selectedAction) {
      toast.error("Please fill in all required fields: Name, Trigger, and Action.");
      return;
    }

    const payload: any = {
      name: workflowName,
      description: workflowDescription,
      trigger_id: parseInt(selectedTrigger),
      action_id: parseInt(selectedAction),
      rule_type: workflowType,
      is_active: isActive,
    };

    if (workflowType === "scheduled") {
      const delay = parseInt(delayTime, 10);
      if (isNaN(delay) || delay <= 0) {
        toast.error("Please enter a valid positive number for delay time.");
        return;
      }
      payload.delay_time = delay;
      payload.delay_unit = delayUnit;
    } else {
      payload.delay_time = null;
      payload.delay_unit = null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newWorkflow = await response.json();
        toast.success(`Workflow "${newWorkflow.name}" saved successfully!`);
        setWorkflowName("");
        setWorkflowDescription("");
        setSelectedTrigger("");
        setSelectedAction("");
        setWorkflowType("immediate");
        setDelayTime("15");
        setDelayUnit("minutes");
        setIsActive(true);
      } else {
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred." }));
        toast.error(`Failed to save workflow: ${errorData.detail || response.statusText}`);
        console.error("Error saving workflow:", errorData);
      }
    } catch (error) {
      toast.error("An error occurred while saving the workflow. Please check your connection.");
      console.error("Network error:", error);
    }
  }

  // Display loading or error states if necessary
  if (isLoadingData) return <p className="text-center p-8">Loading workflow options...</p>;
  if (errorData) return <p className="text-center p-8 text-red-600">Error loading data: {errorData}</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Workflow</h1>

        <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary-100 p-1 rounded-full">
            <TabsTrigger value="ai" className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              AI-Powered Creation
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <ArrowRight className="h-4 w-4" />
              Manual Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card className="suiteop-card">
              <CardHeader>
                <CardTitle>Create with AI</CardTitle>
                <CardDescription>
                  Describe your workflow in natural language and let AI configure it for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Describe your workflow</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="E.g., Send a welcome email when a guest checks in, or create a cleaning task 2 hours after checkout"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific about triggers, actions, and timing if applicable.
                  </p>
                </div>

                {aiGlobalErrors.length > 0 && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 space-y-1">
                    <h4 className="font-semibold">AI Global Errors:</h4>
                    <ul className="list-disc list-inside text-sm">
                      {aiGlobalErrors.map((error, index) => (
                        <li key={index}>{typeof error === 'string' ? error : JSON.stringify(error)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={handleGenerateWorkflow} disabled={!aiPrompt || isGenerating} className="w-full">
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Workflow
                    </>
                  )}
                </Button>

                {aiPreviewSuggestions.length > 1 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-lg">Select an AI Suggestion to Load:</h4>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="p-4 space-y-2">
                        {aiPreviewSuggestions.map((preview, index) => (
                          <div 
                            key={index} 
                            className={`p-3 rounded-md flex justify-between items-center transition-colors ${selectedPreviewIndex === index ? 'bg-primary-100' : 'hover:bg-muted/50'}`}
                          >
                            <span className="text-sm font-medium">
                              {index + 1}. {preview.mapped_suggestion.workflow_name || "Unnamed Workflow"}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => populateFormWithSuggestion(preview, index)}
                            >
                              Load Suggestion
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="suiteop-card">
              <CardHeader>
                <CardTitle>Manual Configuration</CardTitle>
                <CardDescription>Configure your workflow step by step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentMappingNotes.length > 0 && (
                  <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700 space-y-1">
                    <h4 className="font-semibold">Notes for this AI Suggestion:</h4>
                    <ul className="list-disc list-inside text-sm">
                      {currentMappingNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      placeholder="E.g., Guest Welcome Email"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      className="rounded-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workflow-type-manual">Workflow Type</Label>
                    <Select value={workflowType} onValueChange={setWorkflowType}>
                      <SelectTrigger id="workflow-type-manual" className="rounded-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="immediate">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span>Immediate</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scheduled">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Scheduled</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    placeholder="Describe what this workflow does"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger (If This...)</Label>
                  <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                    <SelectTrigger id="trigger" className="rounded-full">
                      <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {dbTriggers.map((trigger) => (
                        <SelectItem key={trigger.id} value={String(trigger.id)}>
                          {trigger.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Action (Then That...)</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger id="action" className="rounded-full">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {dbActions.map((action) => (
                        <SelectItem key={action.id} value={String(action.id)}>
                          {action.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {workflowType === "scheduled" && (
                  <div className="space-y-2">
                    <Label>Delay</Label>
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        min="1"
                        value={delayTime}
                        onChange={(e) => setDelayTime(e.target.value)}
                        className="w-24 rounded-full"
                      />
                      <Select value={delayUnit} onValueChange={setDelayUnit}>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Activate workflow immediately</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveWorkflow}
                  disabled={!workflowName || !selectedTrigger || !selectedAction}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Workflow
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
