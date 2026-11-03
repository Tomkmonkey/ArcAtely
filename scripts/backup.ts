import { createBackup } from '../lib/backup';
import { prisma } from '../lib/prisma';
createBackup().then((record) => { console.log(`Backup created: ${record.filename} (${record.size} bytes)`); }).catch((error) => { console.error('Backup failed:', error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
