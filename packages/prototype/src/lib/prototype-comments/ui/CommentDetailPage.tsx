"use client";

import { useLayoutEffect, useMemo, type ReactNode } from "react";

import { useCommentStore } from "../react/CommentProvider";

type CommentDetailPageProps<TState> = {
  id: string;
  basePath?: string;
  renderRestoredView: (props: { route: string }) => ReactNode;
  renderNotFound?: (props: { basePath: string }) => ReactNode;
};

export function CommentDetailPage<TState>({
  id,
  basePath = "/canvas",
  renderRestoredView,
  renderNotFound,
}: CommentDetailPageProps<TState>) {
  const { annotations, restoreComment } = useCommentStore<TState>();

  const annotation = useMemo(
    () => annotations.find((item) => item.id === id),
    [annotations, id]
  );

  useLayoutEffect(() => {
    if (annotation) {
      restoreComment(annotation.id);
    }
  }, [annotation, restoreComment]);

  if (!annotation) {
    if (renderNotFound) {
      return <>{renderNotFound({ basePath })}</>;
    }

    return (
      <div style={{ padding: "40px 24px", textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
        <p style={{ margin: 0, fontSize: "14px" }}>No comment exists with this id.</p>
        <a
          href={basePath}
          style={{
            display: "inline-block",
            marginTop: "16px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.8)",
          }}>
          Back to canvas
        </a>
      </div>
    );
  }

  return <>{renderRestoredView({ route: annotation.interactionState.route })}</>;
}
