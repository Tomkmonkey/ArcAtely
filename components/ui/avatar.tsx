import Image from 'next/image';
import { cn, initials } from '@/lib/utils';
export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return <span className={cn('relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dfe3cd] font-serif font-bold text-[#44503a]', className)} aria-label={name}>
    {src ? <Image src={src} alt="" fill className="object-cover" unoptimized /> : initials(name)}
  </span>;
}
