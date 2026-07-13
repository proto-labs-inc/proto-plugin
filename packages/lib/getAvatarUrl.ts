import { AVATAR_FALLBACK } from "./constants";

export function getAvatarUrl(url?: string | null) {
  return url ?? AVATAR_FALLBACK;
}

export function getUserAvatarUrl(user: { avatarUrl?: string | null } | undefined) {
  return getAvatarUrl(user?.avatarUrl);
}
