import { definePrototypeConfig } from "proto";

import BookingFlow from "./src/prototypes/booking-flow";
import { bookingFlowComponentRegistry } from "./src/prototypes/booking-flow/component-ids";
import BookingsPage from "./src/prototypes/bookings-page";
import { bookingsPageComponentRegistry } from "./src/prototypes/bookings-page/component-ids";
import BookingsPageStateMapPage from "./src/prototypes/bookings-page/state-map-page";
import BookingFlowStateMapPage from "./src/prototypes/booking-flow/state-map-page";
import EventTypes from "./src/prototypes/event-types";
import { eventTypesComponentRegistry } from "./src/prototypes/event-types/component-ids";
import EventTypesStateMapPage from "./src/prototypes/event-types/state-map-page";
import HomePage from "./src/prototypes/home-page";
import { homePageComponentRegistry } from "./src/prototypes/home-page/component-ids";
import ProtoPartnerPage from "./src/prototypes/proto-partner-page";
import { protoPartnerPageComponentRegistry } from "./src/prototypes/proto-partner-page/component-ids";
import ProtoShapes from "./src/prototypes/proto-shapes";
import { protoShapesComponentRegistry } from "./src/prototypes/proto-shapes/component-ids";
import AutomatWorkflowsPage from "./src/prototypes/automat-workflows-page";
import { automatWorkflowsPageComponentRegistry } from "./src/prototypes/automat-workflows-page/component-ids";
import AutomatWorkflowsPageStateMapPage from "./src/prototypes/automat-workflows-page/state-map-page";
import TableEditorFilters from "./src/prototypes/table-editor-filters";
import { tableEditorFiltersComponentRegistry } from "./src/prototypes/table-editor-filters/component-ids";
import TableEditorFiltersStateMapPage from "./src/prototypes/table-editor-filters/state-map-page";

export default definePrototypeConfig({
  prototypes: [
    {
      slug: "proto-shapes",
      title: "Proto Shapes",
      screenshot: "/prototypes/screenshots/proto-shapes.png",
      component: ProtoShapes,
      componentRegistry: protoShapesComponentRegistry,
    },
    {
      slug: "proto-partner-page",
      title: "Proto Partner Page",
      screenshot: "/prototypes/screenshots/proto-partner-page.png",
      component: ProtoPartnerPage,
      componentRegistry: protoPartnerPageComponentRegistry,
    },
    {
      slug: "home-page",
      title: "Home page",
      screenshot: "/prototypes/screenshots/home-page.png",
      component: HomePage,
      componentRegistry: homePageComponentRegistry,
    },
    {
      slug: "booking-flow",
      title: "Booking flow",
      screenshot: "/prototypes/screenshots/booking-flow.png",
      component: BookingFlow,
      componentRegistry: bookingFlowComponentRegistry,
      stateMapComponent: BookingFlowStateMapPage,
    },
    {
      slug: "bookings-page",
      title: "Bookings page",
      screenshot: "/prototypes/screenshots/bookings-page.png",
      component: BookingsPage,
      componentRegistry: bookingsPageComponentRegistry,
      stateMapComponent: BookingsPageStateMapPage,
    },
    {
      slug: "event-types",
      title: "Event types",
      screenshot: "/prototypes/screenshots/event-types.png",
      component: EventTypes,
      componentRegistry: eventTypesComponentRegistry,
      stateMapComponent: EventTypesStateMapPage,
    },
    {
      slug: "automat-workflows-page",
      title: "Automat Workflows Page",
      screenshot: "/prototypes/screenshots/automat-workflows-page.png",
      component: AutomatWorkflowsPage,
      componentRegistry: automatWorkflowsPageComponentRegistry,
      stateMapComponent: AutomatWorkflowsPageStateMapPage,
    },
    {
      slug: "table-editor-filters",
      title: "Table Editor Filters",
      screenshot: "/prototypes/screenshots/table-editor-filters.png",
      component: TableEditorFilters,
      componentRegistry: tableEditorFiltersComponentRegistry,
      stateMapComponent: TableEditorFiltersStateMapPage,
    },
  ],
});
