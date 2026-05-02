import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_PIXEL_DIMENSION,
  type AcceptedMimeType,
} from './constants';

export type RejectionReason =
  | 'unsupported-mime'
  | 'file-too-large'
  | 'decode-failed'
  | 'pixel-too-large'
  | 'too-many';

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: Exclude<RejectionReason, 'too-many'> };

export const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  'unsupported-mime': '지원하지 않는 형식이에요. PNG, JPG, WebP만 처리할 수 있어요.',
  'file-too-large': '파일이 너무 커요 (최대 10MB).',
  'decode-failed': '이미지를 읽을 수 없어요. 파일이 손상됐을 수 있어요.',
  'pixel-too-large': '이미지가 너무 커요 (최대 4096px). 작게 줄여서 다시 올려주세요.',
  'too-many': '한 번에 최대 10장까지만 처리할 수 있어요. 일부만 추가했어요.',
};

export function validateFileMeta(file: { type: string; size: number }): ValidationResult {
  if (!isAcceptedMime(file.type)) {
    return { ok: false, reason: 'unsupported-mime' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: 'file-too-large' };
  }
  return { ok: true };
}

export function validateBitmapSize(width: number, height: number): ValidationResult {
  if (width > MAX_PIXEL_DIMENSION || height > MAX_PIXEL_DIMENSION) {
    return { ok: false, reason: 'pixel-too-large' };
  }
  return { ok: true };
}

function isAcceptedMime(mime: string): mime is AcceptedMimeType {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime);
}
