export const PROTOTYPE_TWEAK_CATEGORY_LABELS = {
  state: "State",
  variants: "Variants",
} as const;

export type PrototypeTweakCategory = keyof typeof PROTOTYPE_TWEAK_CATEGORY_LABELS;

export const PROTOTYPE_TWEAK_CATEGORY_ORDER: PrototypeTweakCategory[] = [
  "state",
  "variants",
];

export type PrototypeTweakDefinition = {
  id: string;
  label: string;
  targetId: string;
  category: PrototypeTweakCategory;
};

export type PrototypeTweaksRegistration = {
  items: PrototypeTweakDefinition[];
  navigateTo: (id: string) => void;
};

export function groupPrototypeTweaksByCategory(items: PrototypeTweakDefinition[]) {
  return PROTOTYPE_TWEAK_CATEGORY_ORDER.map((category) => ({
    category,
    label: PROTOTYPE_TWEAK_CATEGORY_LABELS[category],
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
