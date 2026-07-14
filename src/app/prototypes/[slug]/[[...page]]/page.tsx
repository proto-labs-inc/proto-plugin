import { createPrototypePage, createPrototypeStateMapPage } from "proto-plugin";
import { notFound } from "next/navigation";

import prototypeConfig from "../../../../../prototype.config";
import {
  PARTNER_PAGE_PROTOTYPE_SLUG,
  PARTNER_PAGE_STATIC_SEGMENTS,
} from "../../../../prototypes/proto-partner-page/partner-page-routes";

const prototypePage = createPrototypePage(prototypeConfig);
const stateMapPage = createPrototypeStateMapPage(prototypeConfig);

type PrototypeRoutePageProps = {
  params: Promise<{ slug: string; page?: string[] }>;
};

export function generateStaticParams() {
  const prototypeParams = prototypePage.generateStaticParams().flatMap(({ slug }) => {
    const stateMapParam = { slug, page: ["states"] as string[] };

    if (slug === PARTNER_PAGE_PROTOTYPE_SLUG) {
      return [
        { slug, page: undefined },
        stateMapParam,
        ...PARTNER_PAGE_STATIC_SEGMENTS.map((page) => ({ slug, page })),
      ];
    }

    return [{ slug, page: undefined }, stateMapParam];
  });

  return prototypeParams;
}

export default async function PrototypeRoutePage({
  params,
}: PrototypeRoutePageProps) {
  const { slug, page } = await params;

  if (page?.length === 1 && page[0] === "states") {
    return stateMapPage.default({ params: Promise.resolve({ slug }) });
  }

  if (page && page.length > 0) {
    if (slug !== PARTNER_PAGE_PROTOTYPE_SLUG) {
      notFound();
    }

    if (
      page.length > 1 ||
      !PARTNER_PAGE_STATIC_SEGMENTS.some(([segment]) => segment === page[0])
    ) {
      notFound();
    }
  }

  return prototypePage.default({ params: Promise.resolve({ slug }) });
}
