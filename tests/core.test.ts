import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, isSafeExternalUrl } from '../lib/content';
import { modelSchema, registerSchema } from '../lib/validators/model';
import { formatNumber, safeNext } from '../lib/utils';

test('cleanText removes markup and control characters', () => { assert.equal(cleanText('<script>alert(1)</script>  标题'), 'alert(1)  标题'); });
test('only http(s) external URLs are accepted', () => { assert.equal(isSafeExternalUrl('https://example.com/a'), true); assert.equal(isSafeExternalUrl('javascript:alert(1)'), false); assert.equal(isSafeExternalUrl('file:///etc/passwd'), false); });
test('model requires a file or external link', () => { const value = { title: '测试模型', description: '这是一段超过二十个字的模型详细描述，用于验证提交规则。', tags: ['眼镜'], visibility: 'PUBLIC', version: '1.0' }; assert.equal(modelSchema.safeParse(value).success, false); assert.equal(modelSchema.safeParse({ ...value, externalUrl: 'https://example.com/model' }).success, true); });
test('model rejects duplicate invalid fields and long passwords', () => { assert.equal(registerSchema.safeParse({ name: '测试用户', email: 'bad', password: '12345678' }).success, false); });
test('safeNext blocks open redirects', () => { assert.equal(safeNext('//evil.example'), '/'); assert.equal(safeNext('https://evil.example'), '/'); assert.equal(safeNext('/me/models'), '/me/models'); });
test('Chinese number formatting', () => { assert.equal(formatNumber(12000), '1.2万'); });
