import { ArrowUpRight } from "lucide-react";
import { Badge, cn } from "ui";

type MenuItem = {
  key: string;
  name: string;
  label?: string;
  external?: boolean;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const SETTINGS_MENU: MenuGroup[] = [
  {
    title: "Configuration",
    items: [
      { key: "general", name: "General" },
      { key: "api-keys", name: "API Keys" },
      { key: "jwt", name: "JWT Keys" },
      { key: "log-drains", name: "Log Drains" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { key: "api", name: "Data API", external: true },
      { key: "vault", name: "Vault", external: true, label: "Beta" },
    ],
  },
];

function SettingsMenuItem({
  name,
  isActive,
  label,
  external,
}: {
  name: string;
  isActive: boolean;
  label?: string;
  external?: boolean;
}) {
  return (
    <a
      href="#"
      className={cn(
        "my-px mx-3 flex items-center justify-between rounded-md px-3 py-[3px] text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent font-semibold text-foreground"
          : "text-foreground-light hover:bg-sidebar-accent/50 hover:text-foreground",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="truncate">{name}</span>
        {label ? (
          <Badge className="shrink-0" variant="warning">
            {label}
          </Badge>
        ) : null}
      </span>
      {external ? (
        <ArrowUpRight strokeWidth={1} className="h-4 w-4 shrink-0 text-foreground-lighter" />
      ) : null}
    </a>
  );
}

export function SettingsMenu() {
  return (
    <div
      className="h-full shrink-0 overflow-hidden bg-dash-sidebar border-r border-default"
      style={{ width: "28%", minWidth: 240, maxWidth: 360 }}
    >
      <div className="border-default flex min-h-12 items-center border-b px-6">
        <h4 className="text-lg">Settings</h4>
      </div>

      <div className="grow overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {SETTINGS_MENU.map((group, idx) => (
            <div key={group.title}>
              <div className="my-4 space-y-4">
                <div className="md:mx-3">
                  <div className="mb-2 px-3 text-sm uppercase font-mono text-foreground-lighter">
                    {group.title}
                  </div>
                  <div>
                    {group.items.map((item) => (
                      <SettingsMenuItem
                        key={item.key}
                        name={item.name}
                        label={item.label}
                        external={item.external}
                        isActive={item.key === "general"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {idx !== SETTINGS_MENU.length - 1 ? (
                <div className="h-px w-[calc(100%-1.5rem)] mx-auto md:w-full bg-border-overlay" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
