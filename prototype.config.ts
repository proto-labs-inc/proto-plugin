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
  ],
});
