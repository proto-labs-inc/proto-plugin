import { createPrototypeComponentLibraryPage } from "proto-plugin";

import { ComponentLibraryContent } from "./component-library-content";
import { SUPABASE_PRODUCT_THEMES } from "../supabase-product-theme.constants";

export default createPrototypeComponentLibraryPage({
  children: <ComponentLibraryContent />,
  productThemes: SUPABASE_PRODUCT_THEMES,
});
