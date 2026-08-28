import { PrototypeComponent } from "proto-plugin";
import { Button } from "ui";

import { COMMUNITY_QUOTES } from "./front-cover-mock-data";

export function CommunitySection() {
  return (
    <PrototypeComponent id="community-section" className="border-b border-border">
      <div className="flex flex-col items-center gap-3 px-6 py-20">
        <h3 className="text-center text-2xl md:text-4xl">Join the community</h3>
        <p className="text-center text-foreground-lighter">
          Discover what our community has to say about their Supabase experience.
        </p>
        <Button variant="default" size="small" className="mt-2">
          Join us on Discord
        </Button>
      </div>
      <div className="relative h-[420px] overflow-hidden px-4">
        <div
          className="grid grid-cols-2 gap-2 md:grid-cols-3"
          style={{
            maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
          }}
        >
          {COMMUNITY_QUOTES.map((quote) => (
            <article
              key={quote.handle}
              className="rounded-xl border border-border bg-surface-75 p-4"
            >
              <p className="text-sm text-foreground">{quote.name}</p>
              <p className="text-xs text-foreground-lighter">{quote.handle}</p>
              <p className="mt-2 text-sm text-foreground-light">{quote.body}</p>
            </article>
          ))}
        </div>
      </div>
    </PrototypeComponent>
  );
}
