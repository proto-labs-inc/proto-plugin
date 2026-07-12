import "server-only";

import { PrototypeStarterScreensClient } from "@prototype/components/starter-screens/prototype-starter-screens-client";
import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { createStarterScreenRegistry } from "@prototype/lib/prototypes/create-starter-screen-registry";
import type { StarterScreenConfig } from "@prototype/lib/prototypes/starter-screen-config-types";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import { readScreenshotManifest } from "@prototype/lib/prototypes/screenshot-manifest";

const STARTER_SCREENS_HEADER_TITLE = "Starter Screens";
const STARTER_SCREENS_HEADER_DESCRIPTION =
  "Base screens to start your prototype with.";

type PrototypeStarterScreensPageOptions = {
  config?: StarterScreenConfig;
  starterScreensPagePath?: string;
  sourcePath?: string;
};

export function createPrototypeStarterScreensPage(
  options: PrototypeStarterScreensPageOptions = {},
) {
  const {
    config,
    starterScreensPagePath = "src/app/starter-screens/page.tsx",
    sourcePath = process.env.SOURCE_PATH,
  } = options;
  const sourceDirectoryName = formatSourceDirectoryName(sourcePath);
  const registry = config ? createStarterScreenRegistry(config) : null;

  async function StarterScreensGallery() {
    const starterScreens = registry?.getAllStarterScreens() ?? [];
    const screenshotManifest =
      process.env.NODE_ENV === "development"
        ? await readScreenshotManifest()
        : {};
    const screenshotVersions =
      process.env.NODE_ENV === "development" ? screenshotManifest : {};

    return (
      <PrototypeStarterScreensClient
        starterScreens={starterScreens}
        screenshotVersions={screenshotVersions}
        starterScreensPagePath={starterScreensPagePath}
        sourcePath={sourceDirectoryName ?? sourcePath}
      />
    );
  }

  function StarterScreensPage() {
    return (
      <PrototypeGalleryPageLayout
        header={
          <PrototypeGalleryHeader
            title={STARTER_SCREENS_HEADER_TITLE}
            description={STARTER_SCREENS_HEADER_DESCRIPTION}
            className="mb-0"
          />
        }
      >
        <StarterScreensGallery />
      </PrototypeGalleryPageLayout>
    );
  }

  return StarterScreensPage;
}
