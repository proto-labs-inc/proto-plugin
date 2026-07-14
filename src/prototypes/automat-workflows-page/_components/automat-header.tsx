"use client";

import { PrototypeComponent } from "proto-plugin";
import { Badge } from "@coss/ui/components/badge";
import { Button } from "@coss/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@coss/ui/components/menu";
import { SidebarTrigger } from "@coss/ui/components/sidebar";
import { ChevronDown } from "lucide-react";

import {
  AUTOMAT_ORGANIZATION_NAME,
  AUTOMAT_PROJECTS,
} from "./automat-workflows-page-mock-data";
import type { AutomatProjectId } from "./automat-workflows-page-types";

type AutomatHeaderProps = {
  projectId: AutomatProjectId;
  onProjectIdChange: (projectId: AutomatProjectId) => void;
};

export function AutomatHeader({ projectId, onProjectIdChange }: AutomatHeaderProps) {
  const selectedProject =
    AUTOMAT_PROJECTS.find((project) => project.id === projectId) ?? AUTOMAT_PROJECTS[0];

  return (
    <PrototypeComponent id="automat-header">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-sidebar px-4">
        <SidebarTrigger className="-ml-1 size-7" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="flex h-auto items-center gap-1 px-3 py-2 hover:bg-muted">
            <span className="text-sm font-medium">{AUTOMAT_ORGANIZATION_NAME}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          <span className="text-muted-foreground">/</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex h-auto items-center gap-1 px-3 py-2 hover:bg-muted"
                />
              }
            >
              <span className="text-sm font-medium">{selectedProject.name}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium text-foreground">
                  Projects in {AUTOMAT_ORGANIZATION_NAME}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="-mx-1 my-1" />
                {AUTOMAT_PROJECTS.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    className="flex min-h-auto items-center justify-between py-1.5"
                    onClick={() => onProjectIdChange(project.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{project.name}</div>
                      <div className="truncate text-sm text-muted-foreground">
                        {project.description}
                      </div>
                    </div>
                    {project.id === projectId ? (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Current
                      </Badge>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1" />
      </header>
    </PrototypeComponent>
  );
}
