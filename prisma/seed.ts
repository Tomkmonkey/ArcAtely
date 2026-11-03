import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const seedPassword = process.env.SEED_PASSWORD || 'Demo123456';
  if (process.env.NODE_ENV === 'production' && seedPassword === 'Demo123456') {
    throw new Error('生产环境禁止使用默认种子密码，请先设置 SEED_PASSWORD');
  }
  const passwordHash = await hash(seedPassword, 12);
  const users = await Promise.all([
    ['admin@modelhub.local', '岛主', 'SUPER_ADMIN'], ['reviewer@modelhub.local', '审核小舟', 'MODERATOR'],
    ['maker@modelhub.local', '阿柚造物', 'AUTHOR'], ['artist@modelhub.local', '南枝', 'AUTHOR'], ['user@modelhub.local', '模型爱好者', 'USER'],
  ].map(([email, name, role], index) => prisma.user.upsert({ where: { email }, create: { email, name, role: role as 'USER', passwordHash, bio: index === 2 ? '喜欢把日常小物做成温暖的数字模型。' : index === 3 ? '风格化角色与生成式模型爱好者。' : '模型岛社区成员', verified: index < 4, lastLoginAt: new Date() }, update: {} })));
  const [admin, reviewer, maker, artist, member] = users;
  const categories = await Promise.all([['三维模型', '3d'], ['AI 模型', 'ai'], ['角色形象', 'characters'], ['家居生活', 'home']].map(([name, slug], i) => prisma.category.upsert({ where: { slug }, create: { name, slug, sortOrder: i }, update: {} })));
  const tagData = [['眼镜', 'glasses', '复古与未来感眼镜模型'], ['呆萌', 'cute', '可可爱爱的治愈系作品'], ['Blender', 'blender', 'Blender 原生工程'], ['低多边形', 'low-poly', '轻量低多边形模型'], ['LoRA', 'lora', '风格化 LoRA 模型'], ['家居', 'furniture', '家居与生活物件'], ['3D打印', '3d-print', '适合打印的模型']];
  const tags = await Promise.all(tagData.map(([name, slug, description], i) => prisma.tag.upsert({ where: { slug }, create: { name, slug, description, isBuiltin: i < 2 }, update: { description } })));
  const models = [
    { id: 'seed-glasses', title: '复古圆框眼镜 · 低多边形', description: '一副适合风格化角色的复古圆框眼镜，包含完整 Blender 工程和通用 GLB 文件。模型采用低多边形设计，已整理材质与 UV，可直接用于动画、游戏或渲染练习。\n\n允许个人学习与二次创作，商业使用请注明作者。', coverUrl: '/covers/glasses.svg', authorId: maker.id, categoryId: categories[0].id, tags: ['眼镜', '低多边形', 'Blender'], views: 3280, likesCount: 186, favoritesCount: 95, hotScore: 890, featured: true, fileName: 'retro-glasses.glb', fileUrl: '/covers/glasses.svg', format: 'glb', fileSize: 2480000 },
    { id: 'seed-cat', title: '小橘今天也很呆萌', description: '原创 Q 版小橘猫角色，圆滚滚的造型适合桌面摆件和插画场景。包含绑定前的基础网格、三组表情和一套简单材质。\n\n建议使用 Blender 4.x 打开，模型按真实厘米比例制作。禁止转售源文件。', coverUrl: '/covers/covers/cat.svg'.replace('/covers/covers/', '/covers/'), authorId: artist.id, categoryId: categories[2].id, tags: ['呆萌', 'Blender', '3D打印'], views: 5160, likesCount: 342, favoritesCount: 180, hotScore: 1260, featured: true, fileName: 'little-orange.blend', fileUrl: '/covers/cat.svg', format: 'blend', fileSize: 8630000 },
    { id: 'seed-robot', title: '桌面伙伴 R-01 机器人', description: '一个安静陪伴你的桌面机器人。模块化部件方便换色与改装，附待机动画的简单骨骼。GLB 版本可直接导入常见实时引擎，适合初学者练习硬表面建模。', coverUrl: '/covers/robot.svg', authorId: maker.id, categoryId: categories[2].id, tags: ['呆萌', '低多边形'], views: 2140, likesCount: 121, favoritesCount: 64, hotScore: 550, featured: true, fileName: 'desk-robot.glb', fileUrl: '/covers/robot.svg', format: 'glb', fileSize: 4210000 },
    { id: 'seed-chair', title: '中古橡木椅 · 场景资产', description: '根据经典中古家具造型制作的三维椅子，包含 2K PBR 材质、合理拓扑与已展开的 UV。适合室内可视化和产品场景搭建。', coverUrl: '/covers/chair.svg', authorId: artist.id, categoryId: categories[3].id, tags: ['家居', 'Blender'], views: 1720, likesCount: 86, favoritesCount: 73, hotScore: 380, fileName: 'oak-chair.obj', fileUrl: '/covers/chair.svg', format: 'obj', fileSize: 6210000 },
    { id: 'seed-lora', title: '柔光胶片感 LoRA', description: '用于柔光、胶片颗粒与自然肤色表现的实验性 LoRA。推荐权重 0.6–0.8，搭配基础提示词即可获得自然效果。请在合规范围内使用，不用于生成侵权或伤害他人的内容。', coverUrl: '/covers/lora.svg', authorId: artist.id, categoryId: categories[1].id, tags: ['LoRA'], views: 7420, likesCount: 410, favoritesCount: 305, hotScore: 1510, fileName: 'soft-light.safetensors', fileUrl: '/covers/lora.svg', format: 'safetensors', fileSize: 128000000 },
    { id: 'seed-plant', title: '窗边绿植 · 龟背竹', description: '一盆为室内场景准备的龟背竹，叶片使用轻量透明材质，附高模与低模两个版本。可作为建筑可视化或风格化场景的环境点缀。', coverUrl: '/covers/plant.svg', authorId: maker.id, categoryId: categories[3].id, tags: ['家居', '低多边形'], views: 960, likesCount: 48, favoritesCount: 31, hotScore: 220, status: 'PENDING' as const, fileName: 'green-friend.fbx', fileUrl: '/covers/plant.svg', format: 'fbx', fileSize: 5320000 },
  ];
  for (const item of models) {
    const model = await prisma.model.upsert({ where: { id: item.id }, create: { id: item.id, title: item.title, slug: item.id, description: item.description, coverUrl: item.coverUrl, authorId: item.authorId, categoryId: item.categoryId, status: item.status || 'APPROVED', views: item.views, likesCount: item.likesCount, favoritesCount: item.favoritesCount, hotScore: item.hotScore, featured: item.featured || false, fileName: item.fileName, fileUrl: null, externalUrl: `https://example.com/models/${item.id}`, fileSize: item.fileSize, format: item.format, publishedAt: item.status === 'PENDING' ? null : new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000) }, update: {} });
    for (const name of item.tags) { const tag = tags.find((t) => t.name === name)!; await prisma.modelTag.upsert({ where: { modelId_tagId: { modelId: model.id, tagId: tag.id } }, create: { modelId: model.id, tagId: tag.id }, update: {} }); }
  }
  await prisma.follow.upsert({ where: { followerId_followingId: { followerId: member.id, followingId: maker.id } }, create: { followerId: member.id, followingId: maker.id }, update: {} });
  await prisma.like.upsert({ where: { userId_modelId: { userId: member.id, modelId: 'seed-glasses' } }, create: { userId: member.id, modelId: 'seed-glasses' }, update: {} });
  await prisma.favorite.upsert({ where: { userId_modelId: { userId: member.id, modelId: 'seed-glasses' } }, create: { userId: member.id, modelId: 'seed-glasses' }, update: {} });
  await prisma.comment.upsert({ where: { id: 'seed-comment-1' }, create: { id: 'seed-comment-1', modelId: 'seed-glasses', authorId: member.id, content: '线条很干净，放在角色身上效果特别好！' }, update: {} });
  await prisma.comment.upsert({ where: { id: 'seed-comment-2' }, create: { id: 'seed-comment-2', modelId: 'seed-cat', authorId: maker.id, content: '这个小表情太治愈了，期待更多小动物。' }, update: {} });
  await prisma.collection.upsert({ where: { slug: 'weekly-inspiration' }, create: { title: '本周灵感集合', slug: 'weekly-inspiration', description: '编辑精选的社区新作', featured: true, ownerId: admin.id, models: { create: [{ modelId: 'seed-glasses' }, { modelId: 'seed-cat' }] } }, update: {} });
  await prisma.setting.upsert({ where: { key: 'site' }, create: { key: 'site', value: { siteName: '模型岛', announcement: '欢迎来到模型岛！分享模型时请写明授权方式，下载前注意文件安全。', registrationEnabled: true, credentialsEnabled: true, maxImageMb: 5, maxModelMb: 100, tagMinLength: 1, tagMaxLength: 20, moderationEnabled: true, messagesEnabled: true, reportReasons: ['侵权或未经授权', '违法违规内容', '恶意文件或安全风险', '垃圾广告', '其他'] } }, update: {} });
  await prisma.sensitiveWord.upsert({ where: { word: '恶意示例词' }, create: { word: '恶意示例词', severity: 2 }, update: {} });
  await prisma.moderationRecord.upsert({ where: { id: 'seed-moderation-1' }, create: { id: 'seed-moderation-1', targetType: 'MODEL', targetId: 'seed-plant', action: 'SUBMIT', reviewerId: null }, update: {} });
  await prisma.notification.upsert({ where: { id: 'seed-notification-1' }, create: { id: 'seed-notification-1', userId: maker.id, type: 'SYSTEM', title: '创作者中心已就绪', content: '你的作品数据与审核进度都可以在这里查看。', link: '/me/models' }, update: {} });
  console.log('Seed complete. Login with SEED_PASSWORD (or Demo123456 outside production).');
  console.log({ admin: admin.email, reviewer: reviewer.email, author: maker.email, user: member.email });
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
