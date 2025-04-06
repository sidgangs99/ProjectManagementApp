"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { type User } from "@/types/auth";
import axios from "axios";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  });
  const { user, accessToken } = useAuth();

  useEffect(() => {
    if (open) {
      // Fetch team members when dialog opens
      const fetchTeamMembers = async () => {
        try {
          const { data } = await axios.get("/api/users", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          // Filter out current user from selectable members
          setTeamMembers(data.filter((member: User) => member.id !== user?.id));
        } catch (error) {
          console.error("Failed to fetch team members", error);
        }
      };
      fetchTeamMembers();
    }
  }, [open, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        memberIds: selectedMembers,
      });
      setFormData({ name: "", description: "", memberIds: [] });
      setSelectedMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (value: string) => {
    setSelectedMembers((prev) =>
      prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your workspace. Fill in the project details
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter project description"
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label>Team Members</Label>
              <Select value="" onValueChange={handleMemberSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Members</SelectLabel>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          {selectedMembers.includes(member.id) && (
                            <Check className="h-4 w-4" />
                          )}
                          {member.name || member.email}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedMembers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMembers.map((memberId) => {
                    const member = teamMembers.find((m) => m.id === memberId);
                    return (
                      <span
                        key={memberId}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {member?.name || member?.email}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedMembers([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
