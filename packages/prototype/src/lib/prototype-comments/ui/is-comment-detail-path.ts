export function isCanvasPath(pathname: string, basePath = "/canvas"): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function isCanvasDetailPath(pathname: string, basePath = "/canvas"): boolean {
  return pathname !== basePath && pathname.startsWith(`${basePath}/`);
}
