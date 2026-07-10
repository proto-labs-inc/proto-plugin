"use client";

import { PrototypeComponent } from "proto-plugin";
import { Avatar, AvatarFallback, AvatarImage } from "@coss/ui/components/avatar";
import { Button } from "@coss/ui/components/button";
import { Input } from "@coss/ui/components/input";
import { cn } from "@coss/ui/lib/utils";
import {
  Calendar,
  Info,
  MessageCircle,
  PenLine,
  Phone,
  Search,
  X,
} from "lucide-react";

import styles from "../automat-workflows-page.module.scss";
import { AUTOMAT_CHAT_THREADS } from "./automat-workflows-page-mock-data";

type AutomatChatWidgetProps = {
  chatOpen: boolean;
  onChatOpenChange: (open: boolean) => void;
};

export function AutomatChatWidget({ chatOpen, onChatOpenChange }: AutomatChatWidgetProps) {
  return (
    <PrototypeComponent id="automat-chat-widget" className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "absolute bottom-0 right-0 flex flex-col items-end gap-2 transition-all duration-300 ease-out",
          chatOpen
            ? "pointer-events-none translate-y-4 scale-95 opacity-0"
            : "pointer-events-auto translate-y-0 scale-100 opacity-100",
        )}
      >
        <button
          type="button"
          aria-label="Open chat"
          className={cn(
            "relative inline-flex size-16 items-center justify-center rounded-full text-white shadow-lg hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            styles.chatFab,
          )}
          onClick={() => onChatOpenChange(true)}
        >
          <MessageCircle className="size-6" />
        </button>
      </div>

      <div
        className={cn(
          "absolute bottom-0 right-0 flex h-[540px] w-[400px] max-w-[98vw] origin-bottom-right flex-col overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-xl transition-all duration-300 ease-out",
          chatOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Support</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Specialists Online
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Close chat"
              onClick={() => onChatOpenChange(false)}
            >
              <X className="size-6" />
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button variant="secondary" size="icon" className="size-9 shadow-xs">
              <PenLine className="size-4" />
            </Button>
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-9 pl-9 shadow-xs" placeholder="Search" />
            </div>
            <div className="flex items-center gap-0">
              <Button variant="ghost" size="icon" className="size-9">
                <Calendar className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9">
                <Phone className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9">
                <Info className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {AUTOMAT_CHAT_THREADS.map((thread) => (
              <PrototypeComponent
                key={thread.id}
                id={`chat-thread.${thread.id}`}
                as="button"
                type="button"
                className="flex w-full items-start gap-3 p-6 text-left transition-colors hover:bg-accent"
              >
                <Avatar className="size-10 shrink-0 overflow-hidden rounded-full">
                  <AvatarImage
                    alt={thread.name}
                    src={thread.avatar}
                    className={cn(
                      "aspect-square size-full object-cover",
                      thread.grayscale && "grayscale",
                    )}
                  />
                  <AvatarFallback>{thread.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-sm font-semibold">{thread.name}</h4>
                    <span className="shrink-0 text-xs text-muted-foreground">{thread.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{thread.message}</p>
                </div>
              </PrototypeComponent>
            ))}
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
