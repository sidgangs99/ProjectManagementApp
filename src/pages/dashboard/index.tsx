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
  createdAt: string;
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
                    progress={45}
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
