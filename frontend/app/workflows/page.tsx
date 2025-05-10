import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, Filter, Zap, Clock } from "lucide-react"
import Link from "next/link"
import WorkflowList from "@/components/workflow-list"

export default function WorkflowsPage() {
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
          <Input placeholder="Search workflows..." className="pl-8" />
        </div>

        <div className="flex gap-2">
          <Select defaultValue="all">
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

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              <SelectItem value="checkin">Guest checks in</SelectItem>
              <SelectItem value="checkout">Guest checks out</SelectItem>
              <SelectItem value="cleaning">Cleaning completed</SelectItem>
              <SelectItem value="maintenance">Maintenance issue</SelectItem>
              <SelectItem value="booking">Booking canceled</SelectItem>
              <SelectItem value="inventory">Inventory low</SelectItem>
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
          <WorkflowList />
        </TabsContent>

        <TabsContent value="active">
          <WorkflowList filterActive={true} />
        </TabsContent>

        <TabsContent value="inactive">
          <WorkflowList filterActive={false} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
