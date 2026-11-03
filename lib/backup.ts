import { execFile } from 'child_process';
import { mkdir, stat } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';
const exec = promisify(execFile);

export async function createBackup(userId?: string) {
  const dir = path.join(process.cwd(), 'backups');
  await mkdir(dir, { recursive: true });
  const filename = `modelhub-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
  const filepath = path.join(dir, filename);
  const record = await prisma.backupRecord.create({ data: { filename, createdBy: userId } });
  try {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 未配置');
    await exec('pg_dump', ['--dbname', process.env.DATABASE_URL, '--file', filepath, '--format', 'plain', '--no-owner', '--clean', '--if-exists']);
    const info = await stat(filepath);
    return prisma.backupRecord.update({ where: { id: record.id }, data: { status: 'SUCCESS', size: info.size } });
  } catch (error) {
    await prisma.backupRecord.update({ where: { id: record.id }, data: { status: 'FAILED', note: error instanceof Error ? error.message : '未知错误' } });
    throw error;
  }
}
