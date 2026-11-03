'use client';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function MessageButton({ recipientId }: { recipientId: string }) { const router = useRouter(); return <Button variant="outline" onClick={() => router.push(`/messages?to=${recipientId}`)}><MessageCircle className="h-4 w-4" />私信</Button>; }
