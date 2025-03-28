import ProtectedRoute from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ProjectSettingsPage = () => {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState({
    name: "",
    description: "",
    visibility: "private",
    members: [] as any[],
  });
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (user && id) {
      void getProject();
    }
  }, [user, id]);

  const getProject = async () => {
    try {
      setLoading(true);
      toast.info("Loading project data...");

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("user_id, profiles(full_name, avatar_url)")
        .eq("project_id", id);

      if (projectError || membersError) throw projectError || membersError;

      setProject({
        ...projectData,
        members: membersData || [],
      });
      toast.success("Project loaded successfully");
    } catch (error) {
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      toast.info("Updating project...");

      const updates = {
        ...project,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success("Project updated successfully");
    } catch (error) {
      toast.error("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail) return;

    try {
      setLoading(true);
      toast.info(`Inviting ${inviteEmail}...`);

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail)
        .single();

      if (userError || !userData) throw new Error("User not found");

      const { error } = await supabase.from("project_members").insert({
        project_id: id,
        user_id: userData.id,
        role: "member",
      });

      if (error) throw error;

      setInviteEmail("");
      await getProject();
      toast.success(`${inviteEmail} invited successfully`);
    } catch (error) {
      toast.error(
        `Failed to invite ${inviteEmail}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProject} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={project.name}
                  onChange={(e) =>
                    setProject({ ...project, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={project.description}
                  onChange={(e) =>
                    setProject({ ...project, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={project.visibility}
                  onValueChange={(value) =>
                    setProject({ ...project, visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="space-y-2">
                  {project.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 rounded border p-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback>
                          {member.profiles.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {member.profiles.full_name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email to invite"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        inviteMember();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={inviteMember}
                    disabled={!inviteEmail || loading}
                  >
                    Invite
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default ProjectSettingsPage;
