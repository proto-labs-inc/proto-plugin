/** Marker type — gallery routes enabled when config is present (not `false`). */
export type GalleryConfig = Record<string, never>;

export interface GalleryItem {
  id: string;
  blobUrl: string;
  originalBlobUrl?: string;
  title: string;
  tags: string[];
  width: number;
  height: number;
  sourceFrameId?: string;
  uploadedBy: string;
  createdAt: string;
}
