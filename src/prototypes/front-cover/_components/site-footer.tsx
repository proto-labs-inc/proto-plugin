import { PrototypeComponent } from "proto-plugin";

import { FOOTER_COLUMNS } from "./front-cover-mock-data";
import { SupabaseWordmark } from "./supabase-wordmark";

export function SiteFooter() {
  return (
    <PrototypeComponent id="site-footer" className="bg-alternative">
      <div className="section-container grid grid-cols-2 gap-8 py-16 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <SupabaseWordmark className="text-foreground" />
          <p className="mt-4 text-sm text-foreground-lighter">
            The Postgres development platform.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <p className="text-sm text-foreground">{column.title}</p>
            {column.links.map((link) => (
              <span key={link} className="text-sm text-foreground-lighter">
                {link}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="section-container border-t border-border py-6 text-xs text-foreground-muted">
        © Supabase Inc
      </div>
    </PrototypeComponent>
  );
}
