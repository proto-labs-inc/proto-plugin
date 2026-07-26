import { PrototypeSettingsPage } from "@prototype/components/shell/prototype-settings-page";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import { readWorkspaceProfileFromEnv } from "@prototype/lib/prototypes/workspace-profile";

type PrototypeSettingsPageOptions = {
  sourcePath?: string;
  userName?: string;
};

export function createPrototypeSettingsPage(
  options: PrototypeSettingsPageOptions = {},
) {
  // Next/Vercel already merge project env + `.env.local` into process.env.
  const { sourcePath = process.env.SOURCE_PATH } = options;
  const sourceDirectoryName = formatSourceDirectoryName(sourcePath);
  const workspaceProfile = readWorkspaceProfileFromEnv();
  const userName = options.userName ?? workspaceProfile.userName;

  function SettingsPage() {
    return (
      <PrototypeSettingsPage
        sourceDirectoryName={sourceDirectoryName}
        sourcePath={sourcePath}
        userName={userName}
      />
    );
  }

  return SettingsPage;
}
