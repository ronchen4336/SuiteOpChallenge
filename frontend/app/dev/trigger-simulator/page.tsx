"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import WorkflowLogDisplay from "@/components/WorkflowLogDisplay";
import { PlayCircle, Eye, AlertTriangle } from "lucide-react"; // Added AlertTriangle for errors

// Interface for Triggers (similar to Actions but represents Triggers)
interface Trigger {
  id: number | string;
  name: string;
  description?: string;
}

export default function TriggerSimulatorPage() { // Renamed component
  const [triggers, setTriggers] = useState<Trigger[]>([]); // State for triggers
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(true); // Loading state for triggers
  const [errorTriggers, setErrorTriggers] = useState<string | null>(null); // Error state for triggers
  const [activeTab, setActiveTab] = useState("simulate"); // Default to simulate tab

  useEffect(() => {
    const fetchTriggers = async () => {
      setIsLoadingTriggers(true);
      setErrorTriggers(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/triggers/"); // Fetch triggers
        if (!response.ok) {
          throw new Error(`Failed to fetch triggers: ${response.status}`);
        }
        const data = await response.json();
        setTriggers(data);
      } catch (err) {
        console.error("Error fetching triggers:", err);
        setErrorTriggers(err instanceof Error ? err.message : "An unknown error occurred");
        toast.error("Failed to load triggers for simulation.");
      } finally {
        setIsLoadingTriggers(false);
      }
    };
    fetchTriggers();
  }, []);

  const handleSimulateTrigger = async (triggerId: number | string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/rules/simulate-trigger/", { // New endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trigger_id: triggerId }), // Send trigger_id
      });

      const result = await response.json(); // Always parse JSON for details

      if (!response.ok) {
        // Display error from backend if available, otherwise a generic one
        const errorMessage = result.error || result.detail || `Failed to simulate trigger: ${response.status}`;
        toast.error(errorMessage);
        return;
      }
      
      // Handle successful simulation, potentially with partial errors reported by backend
      let successMessage = `Trigger "${triggers.find(t=>t.id === triggerId)?.name || 'Unknown'}" simulated.`;
      if(result.simulated_logs_created && result.simulated_logs_created.length > 0){
        successMessage += ` ${result.simulated_logs_created.length} log(s) created.`
      } else if (result.rules_processed_count === 0) {
        successMessage += ` No active rules found for this trigger.`;
      } else {
         successMessage += ` Processed ${result.rules_processed_count} rule(s).`;
      }
      toast.success(successMessage);

      if (result.simulation_errors && result.simulation_errors.length > 0) {
        result.simulation_errors.forEach((error: any) => {
            const detail = typeof error.details === 'string' ? error.details : JSON.stringify(error.details);
            toast.warning(`Simulation issue: ${detail}`);
        });
      }

    } catch (err) {
      console.error("Error simulating trigger:", err);
      toast.error(err instanceof Error ? err.message : "Failed to simulate trigger.");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Developer Tools: Trigger Simulator & Logs</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary-100 p-1 rounded-full">
            <TabsTrigger value="simulate" className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <PlayCircle className="h-4 w-4" />
              Simulate Trigger
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Eye className="h-4 w-4" />
              View Workflow Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulate">
            {isLoadingTriggers && <p className="text-center p-8">Loading triggers...</p>}
            {errorTriggers && <p className="text-center p-8 text-red-600">Error loading triggers: {errorTriggers}</p>}
            {!isLoadingTriggers && !errorTriggers && (
              <>
                {triggers.length === 0 && (
                  <p className="text-center text-muted-foreground">No triggers found to simulate.</p>
                )}
                <div className="space-y-4">
                  {triggers.map((trigger) => (
                    <Card key={trigger.id} className="suiteop-card">
                      <CardHeader>
                        <CardTitle>{trigger.name}</CardTitle>
                        {trigger.description && (
                          <p className="text-sm text-muted-foreground">{trigger.description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => handleSimulateTrigger(trigger.id)} // Pass trigger.id
                          className="w-full"
                        >
                          Simulate Trigger: "{trigger.name}"
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <WorkflowLogDisplay />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 