// 生成器：.dsh-plugin/client/index.mjs → .dsh-plugin/client.js（bundle 产物，随插件分发）。
// 契约：--check 模式在内存生成后与已提交 .dsh-plugin/client.js 逐字节比对，不一致非零退出——
// 手改生成物禁止（改 client/index.mjs，勿改 client.js）。
// 构建方式：client 是零依赖单文件（无 import），产物 = 源码去 export + 官方
// `__ModuleLoader__.load({ id, factory })` 包装（对齐官方 client bundle 产物结构）。
// 纯文本转换，无外部工具/子进程（Windows 受限环境可用）。
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(import.meta.dirname, '..')
const ENTRY = '.dsh-plugin/client/index.mjs'
const OUTPUT = join(ROOT, '.dsh-plugin', 'client.js')
const ID = 'launch-panel'

export function generate({ check = false, root = ROOT } = {}) {
  const src = readFileSync(ENTRY, 'utf8')
    .replace(/^export const name = 'launch-panel'\n/m, 'const name = "launch-panel";\n')
    .replace(/^export function apply/m, 'function apply')
  const code = Buffer.from(
    `window.__ModuleLoader__.load({\n`
    + `\tid: "${ID}",\n`
    + `\tfactory: (require) => {\n`
    + `\t\tvar module = { exports: {} };\n`
    + `\t\tvar exports = module.exports;\n`
    + src.replace(/\n$/, '')
    + `\n\t\tmodule.exports.name = name;\n`
    + `\t\tmodule.exports.apply = apply;\n`
    + `\t\treturn module.exports;\n`
    + `\t}\n`
    + `});\n`,
  )
  const outputPath = root === ROOT ? OUTPUT : join(root, '.dsh-plugin', 'client.js')
  if (!check) {
    writeFileSync(outputPath, code)
    return { ok: true }
  }
  let committed = null
  try {
    committed = readFileSync(outputPath)
  } catch {
    return { ok: false, errors: [`${outputPath} 不存在：运行 node scripts/build-client.mjs 生成`] }
  }
  if (Buffer.compare(committed, code) !== 0) {
    return { ok: false, errors: ['client.js 与生成器输出不一致：运行 node scripts/build-client.mjs 重新生成（手改生成物禁止）'] }
  }
  return { ok: true }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const check = process.argv.includes('--check')
  const result = generate({ check })
  if (!result.ok) {
    for (const e of result.errors ?? []) console.error(`[build-client] ${e}`)
    process.exit(1)
  }
  console.log(check ? '[build-client] client.js 新鲜（--check OK）' : '[build-client] client.js 已生成')
}
