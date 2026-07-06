import { definePrototypeConfig } from "proto-plugin";

import BookingFlow from "./src/prototypes/booking-flow";
import { bookingFlowComponentRegistry } from "./src/prototypes/booking-flow/component-ids";
import BookingsPage from "./src/prototypes/bookings-page";
import { bookingsPageComponentRegistry } from "./src/prototypes/bookings-page/component-ids";
import BookingFlowStateMapPage from "./src/prototypes/booking-flow/state-map-page";
import HomePage from "./src/prototypes/home-page";
import { homePageComponentRegistry } from "./src/prototypes/home-page/component-ids";
import ProtoPartnerPage from "./src/prototypes/proto-partner-page";
import { protoPartnerPageComponentRegistry } from "./src/prototypes/proto-partner-page/component-ids";
import ProtoShapes from "./src/prototypes/proto-shapes";
import { protoShapesComponentRegistry } from "./src/prototypes/proto-shapes/component-ids";

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
    },
  ],
});
