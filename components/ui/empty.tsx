import { PackageOpen } from 'lucide-react';
export function Empty({ title = '这里还没有内容', description = '换个条件试试，或者成为第一个分享的人。', action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center"><PackageOpen className="mb-4 h-10 w-10 text-muted-foreground" /><h3 className="font-serif text-lg font-bold">{title}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
