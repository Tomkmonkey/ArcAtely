'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UploadCloud, Link2, X, Plus, Loader2, FileBox, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
type Initial = { title: string; description: string; coverUrl?: string | null; externalUrl?: string | null; fileUrl?: string | null; fileName?: string | null; fileSize?: number | null; format?: string | null; version: string; categoryId?: string | null; visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE'; tags: string[] };
export function ModelForm({ categories, suggestedTags, initial, modelId }: { categories: { id: string; name: string }[]; suggestedTags: { id: string; name: string }[]; initial?: Initial; modelId?: string }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [uploading, setUploading] = useState(''); const [error, setError] = useState('');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || ''); const [file, setFile] = useState({ url: initial?.fileUrl || '', name: initial?.fileName || '', size: initial?.fileSize || 0 });
  const [tags, setTags] = useState<string[]>(initial?.tags || []); const [tagInput, setTagInput] = useState(''); const [externalUrl, setExternalUrl] = useState(initial?.externalUrl || '');
  function addTag(value: string) { const name = value.trim().replace(/^#/, ''); if (!name) return; if (tags.includes(name)) return setError('标签不能重复'); if (tags.length >= 8) return setError('最多添加 8 个标签'); if (name.length > 20) return setError('单个标签最多 20 字'); setTags([...tags, name]); setTagInput(''); setError(''); }
  async function upload(file: File, kind: 'image' | 'model') {
    setError(''); setUploading(kind);
    try {
      // Vercel 函数限制请求体 4.5MB，优先由浏览器直传 S3；未配置 S3 时回退服务端上传。
      const presignResponse = await fetch('/api/upload/presign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, type: file.type, size: file.size, kind }),
      });
      if (presignResponse.ok) {
        const { data } = await presignResponse.json();
        const directBody = new FormData();
        Object.entries(data.fields as Record<string, string>).forEach(([key, value]) => directBody.append(key, value));
        directBody.append('file', file);
        const uploadResponse = await fetch(data.uploadUrl, { method: 'POST', body: directBody });
        if (!uploadResponse.ok) throw new Error('对象存储直传失败，请检查 S3 CORS 配置');
        if (kind === 'image') setCoverUrl(data.url);
        else setFile({ url: data.url, name: file.name, size: file.size });
        return;
      }
      if (presignResponse.status !== 501) {
        const result = await presignResponse.json();
        throw new Error(result.error || '获取上传地址失败');
      }
      const body = new FormData(); body.append('file', file); body.append('kind', kind);
      const response = await fetch('/api/upload', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '上传失败');
      if (kind === 'image') setCoverUrl(result.data.url);
      else setFile({ url: result.data.url, name: result.data.fileName, size: result.data.size });
    } catch (e) { setError(e instanceof Error ? e.message : '上传失败，请重试'); } finally { setUploading(''); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setLoading(true); const form = new FormData(event.currentTarget);
    const payload = { title: form.get('title'), description: form.get('description'), coverUrl, fileUrl: file.url, fileName: file.name, fileSize: file.size, externalUrl, format: file.name.split('.').pop() || '', version: form.get('version'), categoryId: form.get('categoryId'), visibility: form.get('visibility'), tags };
    try { const response = await fetch(modelId ? `/api/models/${modelId}` : '/api/models', { method: modelId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || '提交失败'); router.push(`/me/models?submitted=1`); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : '提交失败'); window.scrollTo({ top: 0, behavior: 'smooth' }); } finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_330px]"><div className="space-y-7">
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <section className="surface p-5 sm:p-7"><h2 className="mb-5 font-serif text-xl font-bold">基本信息</h2><div className="space-y-5"><div><label htmlFor="title" className="mb-2 block text-sm font-semibold">模型标题 <span className="text-primary">*</span></label><Input id="title" name="title" required minLength={2} maxLength={80} defaultValue={initial?.title} placeholder="用一句清晰的话介绍你的作品" /></div><div><label htmlFor="description" className="mb-2 block text-sm font-semibold">详细介绍 <span className="text-primary">*</span></label><Textarea id="description" name="description" required minLength={20} maxLength={10000} defaultValue={initial?.description} className="min-h-48" placeholder="创作背景、模型特点、使用方法、参数要求、授权说明…（至少 20 字）" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="categoryId" className="mb-2 block text-sm font-semibold">分类</label><select id="categoryId" name="categoryId" defaultValue={initial?.categoryId || ''} className="h-10 w-full rounded-lg border bg-card px-3 text-sm"><option value="">选择分类</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div><label htmlFor="version" className="mb-2 block text-sm font-semibold">版本</label><Input id="version" name="version" required maxLength={30} defaultValue={initial?.version || '1.0'} /></div></div></div></section>
    <section className="surface p-5 sm:p-7"><h2 className="mb-2 font-serif text-xl font-bold">封面与文件</h2><p className="mb-5 text-sm text-muted-foreground">清晰的封面能让作品更容易被发现。模型文件和外链至少填写一项。</p><div className="grid gap-5 sm:grid-cols-2"><label className="relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-secondary/40 text-center hover:border-primary">{coverUrl ? <><Image src={coverUrl} alt="封面预览" fill className="object-cover" unoptimized /><span className="absolute bottom-2 rounded bg-black/60 px-2 py-1 text-xs text-white">点击更换封面</span></> : <>{uploading === 'image' ? <Loader2 className="mb-2 animate-spin" /> : <UploadCloud className="mb-2 h-8 w-8 text-primary" />}<span className="text-sm font-semibold">上传封面</span><span className="mt-1 text-xs text-muted-foreground">JPG/PNG/WebP，最大 5MB</span></>}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={!!uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'image')} /></label><label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-secondary/40 p-4 text-center hover:border-primary">{uploading === 'model' ? <Loader2 className="mb-2 animate-spin" /> : <FileBox className="mb-2 h-8 w-8 text-primary" />}<span className="text-sm font-semibold">{file.name || '上传模型文件'}</span><span className="mt-1 text-xs text-muted-foreground">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB · 点击更换` : 'ZIP、BLEND、GLB、SAFE TENSORS 等，最大 100MB'}</span><input type="file" className="sr-only" disabled={!!uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'model')} /></label></div><div className="mt-5"><label htmlFor="externalUrl" className="mb-2 flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4" />或提供下载外链</label><Input id="externalUrl" type="url" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://example.com/my-model" /><p className="mt-2 text-xs text-muted-foreground">支持可信网盘、Hugging Face、GitHub 等 HTTP(S) 链接。</p></div></section>
    <section className="surface p-5 sm:p-7"><h2 className="mb-2 font-serif text-xl font-bold">标签</h2><p className="mb-4 text-sm text-muted-foreground">最多 8 个。重复或命中敏感词的标签会被拒绝。</p><div className="flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag} variant="secondary" className="px-3 py-1.5">#{tag}<button type="button" onClick={() => setTags(tags.filter((item) => item !== tag))} aria-label={`移除 ${tag}`}><X className="ml-1 h-3 w-3" /></button></Badge>)}</div><div className="mt-3 flex gap-2"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }} placeholder="输入自定义标签，回车添加" maxLength={20} /><Button type="button" variant="outline" onClick={() => addTag(tagInput)}><Plus className="h-4 w-4" />添加</Button></div><div className="mt-4 flex flex-wrap gap-2">{suggestedTags.filter((tag) => !tags.includes(tag.name)).slice(0, 12).map((tag) => <button type="button" key={tag.id} onClick={() => addTag(tag.name)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">+ {tag.name}</button>)}</div></section>
  </div><aside><div className="surface p-5 lg:sticky lg:top-24"><h2 className="font-serif text-lg font-bold">发布设置</h2><div className="mt-5"><label htmlFor="visibility" className="mb-2 block text-sm font-semibold">可见性</label><select id="visibility" name="visibility" defaultValue={initial?.visibility || 'PUBLIC'} className="h-10 w-full rounded-lg border bg-card px-3 text-sm"><option value="PUBLIC">公开 · 审核后所有人可见</option><option value="UNLISTED">不列出 · 仅持链接者可见</option><option value="PRIVATE">私密 · 仅自己可见</option></select></div><div className="mt-5 rounded-xl bg-secondary/60 p-4 text-xs leading-6 text-muted-foreground"><Info className="mb-2 h-4 w-4 text-primary" />提交后将进入审核队列。编辑已发布作品也需要重新审核。请确认你拥有所分享内容的合法权利。</div><Button type="submit" size="lg" className="mt-6 w-full" disabled={loading || !!uploading}>{loading ? <><Loader2 className="animate-spin" />正在提交</> : modelId ? '保存并提交审核' : '提交审核'}</Button><Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => router.back()}>取消</Button></div></aside></form>;
}
