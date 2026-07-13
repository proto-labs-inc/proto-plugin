export const defaultAvatarImage = "/avatar.svg";

export function getPlaceholderAvatar(avatar: string | null | undefined, _name?: string | null) {
  return avatar ?? defaultAvatarImage;
}
