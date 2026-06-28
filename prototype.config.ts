import { definePrototypeConfig } from "proto-plugin";

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
  ],
});
