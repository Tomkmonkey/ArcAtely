import { z } from 'zod';
import { requireUser, ok, fail, handleError } from '@/lib/api';
import { createPresignedUpload, hasS3Storage, validateUploadMeta } from '@/lib/storage';
import { getSiteSettings } from '@/lib/settings';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
export const runtime = 'nodejs';
const schema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().max(100),
  size: z.number().int().positive(),
  kind: z.enum(['image', 'model']),
});
export async function POST(request: Request) {
  const { session, error } = await requireUser(); if (error) return error;
  if (!(await rateLimit(`presign:${session!.user.id}`, 30, 3600)).success) return fail('上传次数已达上限，请稍后重试', 429);
  if (!hasS3Storage()) return fail('未配置 S3，请使用本地上传接口', 501);
  try {
    const input = schema.parse(await request.json());
    const settings = await getSiteSettings();
    const maxMb = input.kind === 'image' ? settings.maxImageMb : settings.maxModelMb;
    const invalid = validateUploadMeta(input, input.kind, maxMb);
    if (invalid) return fail(invalid, 422);
    const result = await createPresignedUpload(input, input.kind, maxMb);
    await audit({ actorId: session!.user.id, action: 'PRESIGNED_UPLOAD_CREATED', targetType: input.kind.toUpperCase(), metadata: { size: input.size, name: input.name } });
    return ok(result, 201);
  } catch (error) { return handleError(error); }
}
