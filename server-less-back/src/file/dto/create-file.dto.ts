export class CreateFileDto {
  filename: string;
}

export class FileResponseDto {
  id: string;
  filename: string;
  status: string;
  uploadedAt: Date;
  analyzedAt?: Date;
}
