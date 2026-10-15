/**
 * Motor Caramelo — uso programático (Node, build scripts, navegador).
 * O mesmo motor que o servidor MCP usa: auditar e transformar qualquer interface.
 */

export { audit, resolveClassColor, type AuditContext, type AuditReport, type Finding, type Severity } from './audit';
export { transform, type ManualItem, type TransformOptions, type TransformReport } from './transform';
export { parseCss, type CssRule } from './css';
export { contrastRatio, deltaE, hueFamily, parseColor, toHex, toOklch, type HueFamily, type RGB } from './color';
export { nearestBrand, roleHex, type AccentStrategy, type Polarity } from './brand';
export type { Change, ChangeKind } from './edits';
export type { Material } from './tailwind-map';
