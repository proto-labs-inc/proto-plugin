const BRAND_COLOR = "#292929";
const DARK_BRAND_COLOR = "#fafafa";

export function isValidHexCode(hexColor: string): boolean {
  const hexColorPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
  return hexColorPattern.test(hexColor);
}

export function fallBackHex(val: string | null, dark: boolean): string {
  if (val && isValidHexCode(val)) {
    return val;
  }
  return dark ? DARK_BRAND_COLOR : BRAND_COLOR;
}

export function getBrandColours() {
  return {
    light: { brand: "hsla(214, 30%, 16%, 1)" },
    dark: { brand: "hsla(0, 0%, 100%, 1)" },
  };
}
