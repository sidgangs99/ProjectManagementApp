"use client";

import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: any[];
  members: any[];
}

export default function Dashboard() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut, user, accessToken } = useAuth();
  const router = useRouter();

  console.log({ user });
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log({ accessToken });
      const { data } = await axios.get("/api/projects", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!data) throw new Error("Failed to fetch projects");
      console.log({ projects });
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("You've been signed out");
      router.push("/"); // Redirect to signin page
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleCreateProject = async (
    projectData: Record<string, string[] | string>,
  ) => {
    try {
      const { data } = await axios.post(
        "/api/projects",
        {
          body: { ...projectData, ownerId: user?.id },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      setProjects([...projects, data]);
      toast.success("Project created successfully");
      setIsCreateProjectOpen(false);
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  console.log({ projects });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hi, {user?.name ?? user?.email}</h1>
        <div className="flex space-x-4">
          <Button onClick={() => setIsCreateProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>

          <Link href="/profile" className="hover:text-blue-600">
            <Button variant="outline">My Profile</Button>
          </Link>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <ListTodo className="text-blue-500" />
            <div>
              <p className="text-muted-foreground text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="text-yellow-500" />
            <div>
              <p className="text-muted-foreground text-sm">In Progress</p>
              <p className="text-2xl font-bold">{inProgressTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" />
            <div>
              <p className="text-muted-foreground text-sm">Completed</p>
              <p className="text-2xl font-bold">{completedTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="text-purple-500" />
            <div>
              <p className="text-muted-foreground text-sm">Team Members</p>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
          </div>
        </Card>
      </div> */}

      {/* <div className="mb-4 flex items-center justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsContent value="grid" className="space-y-4">
          {loading ? (
            <div className="text-center">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {projects.length ? (
                projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.name}
                    description={project.description}
                    progress={parseInt(Math.random() * 100)}
                    dueDate={project.createdAt}
                    members={project.members.length}
                    tasks={1}
                  />
                ))
              ) : (
                <div>
                  No task found, start new task by clicking new Task button
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="list">
          <div className="space-y-2">{/* List view implementation */}</div>
        </TabsContent>
      </Tabs>

      <CreateProjectDialog
        open={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
