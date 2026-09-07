// src/lib/templates.ts
export const TEMPLATE_KEYS = ['classic', 'terminal', 'editorial', 'dossier', 'digest'] as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const DEFAULT_TEMPLATE: TemplateKey = 'classic';

export function resolveTemplate(value: unknown): TemplateKey {
  if (typeof value === 'string' && (TEMPLATE_KEYS as readonly string[]).includes(value)) {
    return value as TemplateKey;
  }
  return DEFAULT_TEMPLATE;
}

/** dossier 模板的确定性档案编号：slug 各字符 charCode 求和 mod 1000 */
export function dossierNumber(slug: string): number {
  let sum = 0;
  for (const ch of slug) sum += ch.charCodeAt(0);
  return sum % 1000;
}
