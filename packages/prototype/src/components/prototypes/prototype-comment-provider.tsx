"use client";

import type { ReactNode } from "react";

import { PrototypeTargetIdProvider } from "@prototype/components/prototypes/prototype-target";
import { CommentProvider } from "@prototype/lib/prototype-comments/react/CommentProvider";
import type { PrototypeComponentRegistry } from "@prototype/lib/prototypes/prototype-component-registry";
import { getPrototypeComponentRegistryForSlug } from "@prototype/lib/prototypes/create-prototype-registry";
import {
  PrototypeCommentRegistryProvider,
  usePrototypeCommentRegistry,
} from "@prototype/lib/prototypes/prototype-comment-registry";

function PrototypeCommentProviderInner({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const { readHandlers } = usePrototypeCommentRegistry();

  return (
    <CommentProvider
      slug={slug}
      getLiveState={() => readHandlers()?.getLiveState() ?? {}}
      onRestore={(live) => readHandlers()?.onRestore(live)}
    >
      {children}
    </CommentProvider>
  );
}

type PrototypeCommentRootProps = {
  slug: string;
  componentRegistry?: PrototypeComponentRegistry;
  children: ReactNode;
};

/** Registry + slug-scoped CommentProvider for prototype routes. */
export function PrototypeCommentRoot({
  slug,
  componentRegistry,
  children,
}: PrototypeCommentRootProps) {
  const resolvedRegistry =
    componentRegistry ?? getPrototypeComponentRegistryForSlug(slug);

  return (
    <PrototypeCommentRegistryProvider>
      <PrototypeTargetIdProvider slug={slug} registry={resolvedRegistry}>
        <PrototypeCommentProviderInner slug={slug}>
          {children}
        </PrototypeCommentProviderInner>
      </PrototypeTargetIdProvider>
    </PrototypeCommentRegistryProvider>
  );
}
