import { createPrototypeGalleryPage } from "proto-plugin/server";

import prototypeConfig from "../../prototype.config";
import starterScreensConfig from "../../starter-screens.config";

export default createPrototypeGalleryPage(prototypeConfig, {
  starterScreensConfig,
});
