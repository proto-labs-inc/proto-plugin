export type UserProfile = {
  id: number;
  upId: string;
  username: string;
  organizationId: number | null;
  organization: {
    id: number;
    slug: string | null;
    requestedSlug: string | null;
    name?: string;
    logoUrl?: string;
    calVideoLogo?: string;
  } | null;
};
