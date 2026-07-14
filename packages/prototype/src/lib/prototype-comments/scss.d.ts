// Type declarations for SCSS modules
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: { [key: string]: string };
  export default content;
}

declare module "*.png" {
  const value: {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };
  export default value;
}
