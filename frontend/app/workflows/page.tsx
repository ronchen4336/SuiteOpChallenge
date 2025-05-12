"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, Filter, Zap, Clock } from "lucide-react"
import Link from "next/link"
import WorkflowList from "@/components/workflow-list"

// Define interface for the fetched trigger data
interface TriggerItem {
  id: number | string;
  name: string;
  description?: string;
}

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterTrigger, setFilterTrigger] = useState("all")
  const [availableTriggers, setAvailableTriggers] = useState<TriggerItem[]>([])
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(true)
  const [errorTriggers, setErrorTriggers] = useState<string | null>(null)

  useEffect(() => {
    const fetchTriggers = async () => {
      setIsLoadingTriggers(true)
      setErrorTriggers(null)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/triggers/`)
        if (!response.ok) {
          throw new Error(`Failed to fetch triggers: ${response.status}`)
        }
        const data = await response.json()
        setAvailableTriggers(data.results || data) // Adjust if API structure differs
      } catch (error) {
        console.error("Error fetching triggers:", error)
        setErrorTriggers(error instanceof Error ? error.message : String(error))
      } finally {
        setIsLoadingTriggers(false)
      }
    }

    fetchTriggers()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your automation workflows</p>
        </div>
        <Link href="/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Workflow
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="immediate">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Immediate</span>
                </div>
              </SelectItem>
              <SelectItem value="scheduled">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>Scheduled</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTrigger} onValueChange={setFilterTrigger}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              {isLoadingTriggers ? (
                <SelectItem value="loading" disabled>Loading triggers...</SelectItem>
              ) : errorTriggers ? (
                <SelectItem value="error" disabled>Error loading triggers</SelectItem>
              ) : (
                availableTriggers.map((trigger) => (
                  <SelectItem key={trigger.id} value={trigger.name}>
                    {trigger.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full px-4 py-2">
            All Workflows
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full px-4 py-2">
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-full px-4 py-2">
            Inactive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WorkflowList
            searchTerm={searchTerm}
            filterType={filterType}
            filterTrigger={filterTrigger}
          />
        </TabsContent>

        <TabsContent value="active">
          <WorkflowList
            filterActive={true}
            searchTerm={searchTerm}
            filterType={filterType}
            filterTrigger={filterTrigger}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <WorkflowList
            filterActive={false}
            searchTerm={searchTerm}
            filterType={filterType}
            filterTrigger={filterTrigger}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
