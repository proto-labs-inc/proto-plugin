import { defineStarterScreenConfig } from "proto-plugin";

import DatabaseStarterScreen from "./src/starter-screens/database";
import ProjectOverviewStarterScreen from "./src/starter-screens/project-overview";
import ProjectSettingsStarterScreen from "./src/starter-screens/project-settings";
import TableEditorStarterScreen from "./src/starter-screens/table-editor";

export default defineStarterScreenConfig({
  starterScreens: [
    {
      slug: "project-overview",
      title: "Project Overview",
      description: "The project home page with connection options and advisor issues",
      screenshot: "/starter-screens/screenshots/project-overview.png",
      component: ProjectOverviewStarterScreen,
    },
    {
      slug: "database",
      title: "Database",
      description: "Schema visualizer and database management navigation",
      screenshot: "/starter-screens/screenshots/database.png",
      component: DatabaseStarterScreen,
    },
    {
      slug: "table-editor",
      title: "Table Editor",
      description: "The place where all the tables are and you can edit them",
      screenshot: "/starter-screens/screenshots/table-editor.png",
      component: TableEditorStarterScreen,
    },
    {
      slug: "project-settings",
      title: "Project Settings",
      description: "General project settings with configuration and integrations navigation",
      screenshot: "/starter-screens/screenshots/project-settings.png",
      component: ProjectSettingsStarterScreen,
    },
  ],
});
