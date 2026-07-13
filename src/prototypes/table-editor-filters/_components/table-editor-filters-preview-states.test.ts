import { describe, expect, it } from "vitest";

import {
  createLiveStateForPreview,
  inferPreviewStateId,
  normalizeTableEditorFiltersLiveState,
  withInferredPreviewState,
} from "./table-editor-filters-preview-states";

describe("table-editor-filters live state", () => {
  it("infers preview state from data mode and side panel", () => {
    expect(
      inferPreviewStateId({ dataMode: "populated", sidePanel: "insert-row" }),
    ).toBe("insert-row");
    expect(
      inferPreviewStateId({ dataMode: "populated", sidePanel: "edit-row" }),
    ).toBe("edit-row");
    expect(
      inferPreviewStateId({ dataMode: "filtered-empty", sidePanel: "none" }),
    ).toBe("filtered-empty");
    expect(inferPreviewStateId({ dataMode: "loading", sidePanel: "none" })).toBe("loading");
    expect(inferPreviewStateId({ dataMode: "error", sidePanel: "none" })).toBe("error");
  });

  it("keeps previewStateId in sync when patching live state", () => {
    const populated = createLiveStateForPreview("populated");
    const filtered = withInferredPreviewState(populated, { dataMode: "filtered-empty" });

    expect(filtered.previewStateId).toBe("filtered-empty");
    expect(filtered.dataMode).toBe("filtered-empty");
  });

  it("creates registry states with the expected fields", () => {
    expect(createLiveStateForPreview("insert-column")).toEqual({
      previewStateId: "insert-column",
      dataMode: "populated",
      sidePanel: "insert-column",
      expandedRowId: null,
      filterInput: "",
      activeFilter: null,
    });
    expect(createLiveStateForPreview("edit-row")).toEqual({
      previewStateId: "edit-row",
      dataMode: "populated",
      sidePanel: "edit-row",
      expandedRowId: 1,
      filterInput: "",
      activeFilter: null,
    });
  });

  it("normalizes restored live state with missing filter fields", () => {
    expect(
      normalizeTableEditorFiltersLiveState({
        previewStateId: "populated",
        dataMode: "populated",
        sidePanel: "none",
        expandedRowId: null,
      }),
    ).toEqual(createLiveStateForPreview("populated"));
  });
});
