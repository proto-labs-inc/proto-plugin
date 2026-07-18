import {
  looksLikeAbsolutePath,
  resolveAbsoluteFilePath,
  resolveSourceRootFromAbsoluteFilePath,
} from "@prototype/lib/prototypes/resolve-file-path";

export type SourceDirectoryPick = {
  name: string;
  path?: string;
};

type FileWithPath = File & { path?: string };

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
};

type DataTransferItemWithHandle = DataTransferItem & {
  getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
};

function basenameFromPath(filePath: string): string {
  const normalized = filePath.replace(/[/\\]+$/, "");
  const segments = normalized.split(/[/\\]/);
  return segments.at(-1) ?? filePath;
}

function resolveRootPathFromFirstFile(first: FileWithPath): string | undefined {
  const electronPath = first.path?.trim();
  if (electronPath) {
    const absoluteFilePath = resolveAbsoluteFilePath(first) ?? electronPath;
    return resolveSourceRootFromAbsoluteFilePath(absoluteFilePath);
  }

  return undefined;
}

function resolveFromFileList(files: FileList | File[]): SourceDirectoryPick | null {
  const list = Array.from(files);
  if (list.length === 0) return null;

  const first = list[0] as FileWithPath;
  const rootPath = resolveRootPathFromFirstFile(first);

  if (rootPath) {
    return {
      name: basenameFromPath(rootPath),
      path: rootPath,
    };
  }

  const relativePath = first.webkitRelativePath?.trim();
  if (relativePath) {
    const [rootName] = relativePath.split("/");
    if (rootName) {
      return { name: rootName };
    }
  }

  return null;
}

function resolveFromDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): SourceDirectoryPick {
  return { name: handle.name };
}

async function resolveFromDataTransferItems(
  dataTransfer: DataTransfer,
): Promise<SourceDirectoryPick | null> {
  const items = Array.from(dataTransfer.items);

  for (const item of items) {
    if (item.kind !== "file") continue;

    const itemWithHandle = item as DataTransferItemWithHandle;
    if (typeof itemWithHandle.getAsFileSystemHandle === "function") {
      try {
        const handle = await itemWithHandle.getAsFileSystemHandle();
        if (handle?.kind === "directory") {
          return resolveFromDirectoryHandle(handle as FileSystemDirectoryHandle);
        }
      } catch {
        // Fall through to file-list resolution below.
      }
    }
  }

  return resolveFromFileList(dataTransfer.files);
}

export function resolveSourceDirectoryAbsolutePath(
  pick: SourceDirectoryPick | null | undefined,
): string | undefined {
  const trimmedPath = pick?.path?.trim();
  if (!trimmedPath || !looksLikeAbsolutePath(trimmedPath)) return undefined;
  return trimmedPath;
}

export async function resolveSourceDirectoryFromDataTransfer(
  dataTransfer: DataTransfer,
): Promise<SourceDirectoryPick | null> {
  return resolveFromDataTransferItems(dataTransfer);
}

export async function pickSourceDirectory(): Promise<SourceDirectoryPick | null> {
  const pickerWindow = window as DirectoryPickerWindow;
  if (typeof pickerWindow.showDirectoryPicker === "function") {
    try {
      const handle = await pickerWindow.showDirectoryPicker();
      return resolveFromDirectoryHandle(handle);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.style.display = "none";

    const cleanup = () => {
      input.remove();
    };

    input.addEventListener("change", () => {
      resolve(resolveFromFileList(input.files ?? []));
      cleanup();
    });

    input.addEventListener("cancel", () => {
      resolve(null);
      cleanup();
    });

    document.body.appendChild(input);
    input.click();
  });
}

export function resolveSourceDirectoryFromFileList(
  files: FileList | null,
): SourceDirectoryPick | null {
  if (!files) return null;
  return resolveFromFileList(files);
}
