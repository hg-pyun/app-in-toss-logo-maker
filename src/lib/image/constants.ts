export const WATERMARK_PATCH_RATIO = 0.10;
export const EDGE_BAND_PX = 3;
export const TARGET_SIZE = 600;

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_PIXEL_DIMENSION = 4096;
export const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];
