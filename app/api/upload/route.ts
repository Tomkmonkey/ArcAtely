import { requireUser, ok, fail } from '@/lib/api';
import { storeFile, validateUpload } from '@/lib/storage';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/audit';
import { getSiteSettings } from '@/lib/settings';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const { session, error } = await requireUser(); if (error) return error;
  if (!(await rateLimit(`upload:${session!.user.id}`, 30, 3600)).success) return fail('上传次数已达上限，请稍后重试', 429);
  try {
    const form = await request.formData(); const file = form.get('file'), kind = form.get('kind') === 'model' ? 'model' : 'image';
    if (!(file instanceof File)) return fail('请选择文件', 422);
    const settings = await getSiteSettings();
    const invalid = validateUpload(file, kind, kind === 'image' ? settings.maxImageMb : settings.maxModelMb); if (invalid) return fail(invalid, 422);
    const stored = await storeFile(file, kind);
    await audit({ actorId: session!.user.id, action: 'FILE_UPLOAD', targetType: kind.toUpperCase(), metadata: { size: stored.size, fileName: stored.fileName } });
    return ok(stored, 201);
  } catch (error) { console.error('[UPLOAD]', error); return fail('上传失败，请检查文件后重试', 500); }
}
