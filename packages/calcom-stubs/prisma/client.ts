export type User = {
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  organizationId?: number | null;
};

export type Team = {
  slug: string | null;
  name: string | null;
  logoUrl: string | null;
};
