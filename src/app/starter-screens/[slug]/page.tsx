import { createPrototypeStarterScreenPage } from "proto-plugin";

import starterScreensConfig from "../../../../starter-screens.config";

const starterScreenPage = createPrototypeStarterScreenPage(starterScreensConfig);

export const generateStaticParams = starterScreenPage.generateStaticParams;

export default starterScreenPage.default;
