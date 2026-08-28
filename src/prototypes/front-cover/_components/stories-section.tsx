import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

import { CUSTOMER_STORIES } from "./front-cover-mock-data";

export function StoriesSection() {
  return (
    <PrototypeComponent id="stories-section">
      <div className="section-container space-y-8 py-16">
        <h3 className="text-2xl text-foreground-lighter md:text-4xl">
          Customer stories
        </h3>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {CUSTOMER_STORIES.map((story) => (
            <article
              key={story.id}
              className={cn(
                "flex min-h-[280px] flex-col justify-between rounded-xl p-5 text-background",
                story.tone === "warning" && "bg-warning",
                story.tone === "brand" && "bg-brand-500",
                story.tone === "foreground" && "bg-foreground text-background",
              )}
            >
              <div className="space-y-3">
                <p className="text-sm font-medium">{story.name}</p>
                <p className="text-lg leading-snug">{story.tagline}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm opacity-90">“{story.quote}”</p>
                <p className="text-xs opacity-70">{story.author}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PrototypeComponent>
  );
}
