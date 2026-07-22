import { createPrototypeDesignSystemPage } from "proto-plugin";

import { DesignSystemContent } from "./design-system-content";
import { SUPABASE_PRODUCT_THEMES } from "../supabase-product-theme.constants";

export default createPrototypeDesignSystemPage({
  children: <DesignSystemContent />,
  productThemes: SUPABASE_PRODUCT_THEMES,
});
