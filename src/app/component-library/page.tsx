import { createPrototypeComponentLibraryPage } from "proto-plugin";

import { ComponentLibraryContent } from "./component-library-content";

export default createPrototypeComponentLibraryPage({
  description:
    "Live previews of synced Cal.com design tokens, @coss/ui primitives, and @calcom/ui product components.",
  children: <ComponentLibraryContent />,
});
