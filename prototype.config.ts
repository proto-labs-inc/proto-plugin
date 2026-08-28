import { definePrototypeConfig } from "proto-plugin";

import ProtoPartnerPage from "./src/prototypes/proto-partner-page";
import { protoPartnerPageComponentRegistry } from "./src/prototypes/proto-partner-page/component-ids";
import ProtoPartnerPageStateMapPage from "./src/prototypes/proto-partner-page/state-map-page";
import TableEditorFilters from "./src/prototypes/table-editor-filters";
import { tableEditorFiltersComponentRegistry } from "./src/prototypes/table-editor-filters/component-ids";
import TableEditorFiltersStateMapPage from "./src/prototypes/table-editor-filters/state-map-page";
import SupabaseHomePage from "./src/prototypes/supabase-home-page";
import { supabaseHomePageComponentRegistry } from "./src/prototypes/supabase-home-page/component-ids";
import SupabaseHomePageStateMapPage from "./src/prototypes/supabase-home-page/state-map-page";
import SupabaseSqlEditor from "./src/prototypes/supabase-sql-editor";
import { supabaseSqlEditorComponentRegistry } from "./src/prototypes/supabase-sql-editor/component-ids";
import SupabaseSqlEditorStateMapPage from "./src/prototypes/supabase-sql-editor/state-map-page";
import SupabaseDatabaseView from "./src/prototypes/supabase-database-view";
import { supabaseDatabaseViewComponentRegistry } from "./src/prototypes/supabase-database-view/component-ids";
import SupabaseDatabaseViewStateMapPage from "./src/prototypes/supabase-database-view/state-map-page";
import SupabaseLogs from "./src/prototypes/supabase-logs";
import { supabaseLogsComponentRegistry } from "./src/prototypes/supabase-logs/component-ids";
import SupabaseLogsStateMapPage from "./src/prototypes/supabase-logs/state-map-page";
import FrontCover from "./src/prototypes/front-cover";
import { frontCoverComponentRegistry } from "./src/prototypes/front-cover/component-ids";
import FrontCoverStateMapPage from "./src/prototypes/front-cover/state-map-page";

export default definePrototypeConfig({
  bootstrap: {
    requirementOrder: [
      "sourceLinked",
      "userName",
      "designTokens",
      "uiPrimitives",
      "sharedBlocks",
    ],
    paths: {
      designTokens: [
        "src/app/globals.css",
        "packages/config/tailwind.config.css",
      ],
      uiPrimitives: [
        "packages/ui/src/components/shadcn",
        "apps/studio/components/ui",
      ],
      sharedBlocks: [
        "packages/ui-patterns/src",
        "packages/common",
        "src/lib/cn.ts",
      ],
    },
  },
  prototypes: [
    {
      slug: "proto-partner-page",
      title: "Proto Marketing Site Partner Page",
      screenshot: "/prototypes/screenshots/proto-partner-page.png",
      component: ProtoPartnerPage,
      componentRegistry: protoPartnerPageComponentRegistry,
      stateMapComponent: ProtoPartnerPageStateMapPage,
    },
    {
      slug: "table-editor-filters",
      title: "Supabase Table Editor Filters",
      screenshot: "/prototypes/screenshots/table-editor-filters.png",
      component: TableEditorFilters,
      componentRegistry: tableEditorFiltersComponentRegistry,
      stateMapComponent: TableEditorFiltersStateMapPage,
    },
    {
      slug: "supabase-home-page",
      title: "Supabase home page",
      screenshot: "/prototypes/screenshots/supabase-home-page.png",
      component: SupabaseHomePage,
      componentRegistry: supabaseHomePageComponentRegistry,
      stateMapComponent: SupabaseHomePageStateMapPage,
    },
    {
      slug: "supabase-sql-editor",
      title: "Supabase SQL editor",
      screenshot: "/prototypes/screenshots/supabase-sql-editor.png",
      component: SupabaseSqlEditor,
      componentRegistry: supabaseSqlEditorComponentRegistry,
      stateMapComponent: SupabaseSqlEditorStateMapPage,
    },
    {
      slug: "supabase-database-view",
      title: "Supabase Database View",
      screenshot: "/prototypes/screenshots/supabase-database-view.png",
      component: SupabaseDatabaseView,
      componentRegistry: supabaseDatabaseViewComponentRegistry,
      stateMapComponent: SupabaseDatabaseViewStateMapPage,
    },
    {
      slug: "supabase-logs",
      title: "Supabase Logs",
      screenshot: "/prototypes/screenshots/supabase-logs.png",
      component: SupabaseLogs,
      componentRegistry: supabaseLogsComponentRegistry,
      stateMapComponent: SupabaseLogsStateMapPage,
    },
    {
      slug: "front-cover",
      title: "Front cover",
      screenshot: "/prototypes/screenshots/front-cover.png",
      component: FrontCover,
      componentRegistry: frontCoverComponentRegistry,
      stateMapComponent: FrontCoverStateMapPage,
    },
  ],
});
