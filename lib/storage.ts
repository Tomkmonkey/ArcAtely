import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const extensions = (process.env.ALLOWED_MODEL_EXTENSIONS || '.zip,.rar,.7z,.blend,.obj,.fbx,.glb,.gltf,.stl,.safetensors,.ckpt,.pt,.pth,.onnx').split(',');

export function validateUploadMeta(file: { name: string; type: string; size: number }, kind: 'image' | 'model', configuredMaxMb?: number) {
  const maxMb = configuredMaxMb || (kind === 'image' ? Number(process.env.MAX_IMAGE_SIZE_MB || 5) : Number(process.env.MAX_MODEL_FILE_SIZE_MB || 100));
  if (file.size <= 0 || file.size > maxMb * 1024 * 1024) return `文件不能为空且不能超过 ${maxMb}MB`;
  if (kind === 'image' && !imageTypes.includes(file.type)) return '封面仅支持 JPG、PNG、WebP、GIF';
  const ext = path.extname(file.name).toLowerCase();
  if (kind === 'model' && !extensions.includes(ext)) return `不支持的模型格式：${ext}`;
  if (file.name.includes('..') || /[\\/]/.test(file.name)) return '文件名不合法';
  return null;
}
export function validateUpload(file: File, kind: 'image' | 'model', configuredMaxMb?: number) {
  return validateUploadMeta({ name: file.name, type: file.type, size: file.size }, kind, configuredMaxMb);
}
export function hasS3Storage() {
  return Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_PUBLIC_URL);
}
function s3Client() {
  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1', endpoint: process.env.S3_ENDPOINT,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  });
}
export function storageKey(originalName: string, kind: 'image' | 'model') {
  const ext = path.extname(originalName).toLowerCase();
  return `${kind}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}${ext}`;
}
export function publicStorageUrl(key: string) {
  return `${process.env.S3_PUBLIC_URL!.replace(/\/$/, '')}/${key}`;
}
export async function createPresignedUpload(input: { name: string; type: string; size: number }, kind: 'image' | 'model', maxMb: number) {
  const key = storageKey(input.name, kind);
  const contentType = input.type || 'application/octet-stream';
  const { url, fields } = await createPresignedPost(s3Client(), {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Expires: 300,
    Fields: { 'Content-Type': contentType },
    Conditions: [
      ['content-length-range', 1, maxMb * 1024 * 1024],
      ['eq', '$Content-Type', contentType],
    ],
  });
  return { uploadUrl: url, fields, url: publicStorageUrl(key), key, expiresIn: 300 };
}
export async function storeFile(file: File, kind: 'image' | 'model') {
  const ext = path.extname(file.name).toLowerCase();
  const key = storageKey(file.name, kind);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (hasS3Storage()) {
    const s3 = s3Client();
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: bytes, ContentType: file.type || 'application/octet-stream' }));
    return { url: publicStorageUrl(key), size: file.size, fileName: file.name };
  }
  const directory = path.join(process.cwd(), 'public', 'uploads', kind);
  await mkdir(directory, { recursive: true });
  const localName = `${randomUUID()}${ext}`;
  await writeFile(path.join(directory, localName), bytes, { flag: 'wx' });
  return { url: `/uploads/${kind}/${localName}`, size: file.size, fileName: file.name };
}
