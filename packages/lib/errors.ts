export class HttpError extends Error {}

export function getErrorFromUnknown(cause: unknown): Error {
  if (cause instanceof Error) {
    return cause;
  }
  if (typeof cause === "string") {
    return new Error(cause);
  }
  return new Error("Unknown error");
}
