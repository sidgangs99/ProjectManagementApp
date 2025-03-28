import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import {
  CheckIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { NotebookIcon, TrashIcon } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  due_date: string | null;
  created_at: string;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeProjects, setActiveProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      void fetchTasks();
      void fetchProjects();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("project_members")
        .select("project_id, projects(name)")
        .eq("user_id", user?.id);

      if (error) throw error;
      setActiveProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTaskTitle,
            user_id: user?.id,
            status: "todo",
          },
        ])
        .select();

      if (error) throw error;
      if (data) {
        setTasks([data[0], ...tasks]);
        setNewTaskTitle("");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | Task Manager</title>
      </Head>

      <div className="bg-muted/40 min-h-screen">
        {/* Header */}
        <header className="bg-background shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user?.email}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Your Profile</Link>
                  </DropdownMenuItem>
                  {activeProjects.length > 0 && (
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/projects/${activeProjects[0].project_id}/settings`}
                      >
                        Project Settings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      router.push("/auth/signin");
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCard
              title="Total Tasks"
              value={tasks.length}
              icon={<NotebookIcon className="h-6 w-6" />}
            />
            <StatsCard
              title="To Do"
              value={tasks.filter((t) => t.status === "todo").length}
              icon={<CircleIcon className="h-6 w-6" />}
              variant="warning"
            />
            <StatsCard
              title="In Progress"
              value={tasks.filter((t) => t.status === "in_progress").length}
              icon={<ClockIcon className="h-6 w-6" />}
              variant="info"
            />
            <StatsCard
              title="Completed"
              value={tasks.filter((t) => t.status === "done").length}
              icon={<CheckIcon className="h-6 w-6" />}
              variant="success"
            />
            <StatsCard
              title="Projects"
              value={activeProjects.length}
              icon={<FileTextIcon className="h-6 w-6" />}
              variant="purple"
              action={
                <Link
                  href="/projects/create"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Create new
                </Link>
              }
            />
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Task Management (2/3 width) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-2">
                  <Input
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                  <Button onClick={addTask} disabled={!newTaskTitle.trim()}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No tasks yet. Add your first task above!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={updateTaskStatus}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Sidebar (1/3 width) */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.map((project) => (
                      <ProjectCard key={project.project_id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 py-8 text-center">
                    <p className="text-muted-foreground">No projects yet</p>
                    <Button asChild>
                      <Link href="/projects/create">Create Project</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Additional components
function StatsCard({
  title,
  value,
  icon,
  variant = "default",
  action,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "info" | "success" | "purple";
  action?: React.ReactNode;
}) {
  const variantClasses = {
    default: "bg-primary",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    success: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-lg p-3 ${variantClasses[variant]}`}>
              {icon}
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const statusVariants = {
    todo: { label: "To Do", variant: "secondary" },
    in_progress: { label: "In Progress", variant: "default" },
    done: { label: "Done", variant: "outline" },
  };

  return (
    <Card className={task.status === "done" ? "opacity-70" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`font-medium ${task.status === "done" ? "line-through" : ""}`}
              >
                {task.title}
              </p>
              <Badge variant={statusVariants[task.status].variant as any}>
                {statusVariants[task.status].label}
              </Badge>
            </div>
            {task.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={task.status}
              onChange={(e) =>
                onStatusChange(task.id, e.target.value as Task["status"])
              }
              className="rounded-md border p-2 text-sm"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
            >
              <TrashIcon className="text-destructive h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Link href={`/projects/${project.project_id}`} className="block">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{project.projects.name}</h4>
            <Badge variant="secondary">3 tasks</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Last updated today
            </span>
            <Link
              href={`/projects/${project.project_id}/settings`}
              className="text-primary text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Settings
            </Link>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
