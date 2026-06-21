"use client";

import { useRouter } from "next/navigation";

import { useCommentStore } from "../react/CommentProvider";
import { CommentsGrid } from "./CommentsGrid";

type CommentsListPageProps = {
  basePath?: string;
};

export function CommentsListPage({ basePath = "/canvas" }: CommentsListPageProps) {
  const router = useRouter();
  const { annotations, deleteAnnotation, updateAnnotation, resolveAnnotation } = useCommentStore();

  return (
    <CommentsGrid
      annotations={annotations}
      onSelect={(id) => router.push(`${basePath}/${id}`)}
      onDelete={deleteAnnotation}
      onUpdateComment={updateAnnotation}
      onResolve={resolveAnnotation}
    />
  );
}
