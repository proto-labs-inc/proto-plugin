"use client";

import { PrototypeComponent } from "proto-plugin";
import { Button } from "@coss/ui/components/button";
import { Ellipsis, UserRound } from "lucide-react";

export function AutomatDemoLauncher() {
  return (
    <PrototypeComponent
      id="automat-demo-launcher"
      className="fixed bottom-4 left-0 z-40 flex w-[17rem] justify-center pt-4 pr-4 pl-4"
    >
      <div className="flex w-full items-center gap-2 rounded-xl bg-black/80 p-3 shadow-2xl backdrop-blur-xl">
        <a
          href="https://runautomat.com/contact"
          target="_blank"
          rel="noreferrer"
          aria-label="Contact Sales"
          className="flex-1"
        >
          <Button
            variant="ghost"
            className="h-6 w-full rounded-md bg-white/10 px-2 py-4 text-xs text-white shadow-xs hover:bg-white/20 hover:opacity-80"
          >
            <UserRound className="h-4 w-4 opacity-90" />
            Contact Sales
          </Button>
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md bg-white/10 px-4 py-4 text-white shadow-xs hover:bg-white/20 hover:opacity-80"
          aria-label="Open demo menu"
        >
          <Ellipsis className="h-4 w-4 opacity-90" />
        </Button>
      </div>
    </PrototypeComponent>
  );
}
