import { createPrototypePage } from "proto-plugin";

import prototypeConfig from "../../../../prototype.config";

const page = createPrototypePage(prototypeConfig);
export default page.default;
export const generateStaticParams = page.generateStaticParams;
