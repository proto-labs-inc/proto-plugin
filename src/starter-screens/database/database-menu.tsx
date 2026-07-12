import { cn } from "ui";

type MenuItem = {
  key: string;
  name: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const DATABASE_MENU: MenuGroup[] = [
  {
    title: "Database Management",
    items: [
      { key: "schemas", name: "Schema Visualizer" },
      { key: "tables", name: "Tables" },
      { key: "functions", name: "Functions" },
      { key: "triggers", name: "Triggers" },
      { key: "types", name: "Enumerated Types" },
      { key: "extensions", name: "Extensions" },
      { key: "indexes", name: "Indexes" },
      { key: "publications", name: "Publications" },
    ],
  },
  {
    title: "Access Control",
    items: [
      { key: "policies", name: "Policies" },
      { key: "roles", name: "Roles" },
    ],
  },
  {
    title: "Configuration",
    items: [{ key: "settings", name: "Settings" }],
  },
  {
    title: "Platform",
    items: [{ key: "migrations", name: "Migrations" }],
  },
];

function DatabaseMenuItem({ name, isActive }: { name: string; isActive: boolean }) {
  return (
    <a
      href="#"
      className={cn(
        "my-px mx-3 flex items-center rounded-md px-3 py-[3px] text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent font-semibold text-foreground"
          : "text-foreground-light hover:bg-sidebar-accent/50 hover:text-foreground",
      )}
    >
      {name}
    </a>
  );
}

export function DatabaseMenu() {
  return (
    <div
      className="h-full shrink-0 overflow-hidden bg-dash-sidebar border-r border-default"
      style={{ width: "28%", minWidth: 240, maxWidth: 360 }}
    >
      <div className="border-default flex min-h-12 items-center border-b px-6">
        <h4 className="text-lg">Database</h4>
      </div>

      <div className="grow overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {DATABASE_MENU.map((group, idx) => (
            <div key={group.title}>
              <div className="my-4 space-y-4">
                <div className="md:mx-3">
                  <div className="mb-2 px-3 text-sm uppercase font-mono text-foreground-lighter">
                    {group.title}
                  </div>
                  <div>
                    {group.items.map((item) => (
                      <DatabaseMenuItem
                        key={item.key}
                        name={item.name}
                        isActive={item.key === "schemas"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {idx !== DATABASE_MENU.length - 1 ? (
                <div className="h-px w-[calc(100%-1.5rem)] mx-auto md:w-full bg-border-overlay" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
