import type { ComponentType } from "react";

export type StarterScreenDefinition = {
  slug: string;
  title: string;
  description: string;
  screenshot: string;
  component: ComponentType;
};

export type StarterScreenMetadata = {
  slug: string;
  title: string;
  description: string;
  screenshot: string;
};

export type StarterScreenConfig = {
  starterScreens: StarterScreenDefinition[];
};
