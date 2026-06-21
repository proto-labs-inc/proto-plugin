export function commentToLiveState<TState>(
  comment: TState & { capturedAt: string; route: string },
): TState {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { capturedAt: _capturedAt, route: _route, ...live } = comment as Record<string, unknown>;
  return structuredClone(live) as TState;
}
