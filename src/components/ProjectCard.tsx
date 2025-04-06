"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckSquare, Users } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  members: number;
  tasks: number;
}

export function ProjectCard({
  title,
  description,
  progress,
  dueDate,
  members,
  tasks,
}: ProjectCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="text-muted-foreground flex justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{new Date(dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{members}</span>
            </div>
            <div className="flex items-center">
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>{tasks}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
