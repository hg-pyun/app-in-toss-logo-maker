export type PostProcessStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'failed'
  | 'rejected';

export interface PostProcessItem {
  id: string;
  file: File;
  filename: string;
  sourceUrl?: string;
  resultBlob?: Blob;
  resultUrl?: string;
  status: PostProcessStatus;
  flags?: {
    croppedToSquare: boolean;
    upscaled: boolean;
  };
  error?: string;
}
