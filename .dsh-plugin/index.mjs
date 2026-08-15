// launch-panel Node half：发射数据服务端代理（/launch-panel/launches）+
// 完整火箭页面服务（/launch-panel/page——页面随 npm 包分发，位于包内
// assets/rocket-launch-monitor.html；同源服务使点击链接不受浏览器 http→file:// 拦截）。
// 数据源与中文富化都在服务端完成（src/sources.mjs + src/zh.mjs），client 只渲染。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fetchLaunches } from './src/sources.mjs'
import { enrichLaunch } from './src/zh.mjs'
import { LAUNCHES_PATH, PAGE_PATH } from './src/routes.mjs'

export const name = 'launch-panel'
export const inject = ['webServer']

// 完整火箭监测页：优先从插件包内 assets/ 读取（npm 安装随包分发）；
// 兼容旧布局——包内缺失时回退到插件上级目录下的同名文件。
const PAGE_FILE = join(import.meta.dirname, '..', 'assets', 'rocket-launch-monitor.html')
const PAGE_FILE_LEGACY = join(import.meta.dirname, '..', '..', 'rocket-launch-monitor.html')

function readPageFile() {
  try {
    return readFileSync(PAGE_FILE)
  } catch {
    try {
      return readFileSync(PAGE_FILE_LEGACY)
    } catch {
      return null
    }
  }
}

export function apply(ctx) {
  const webServer = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
  ctx.effect(() => {
    if (webServer === undefined) return () => {}
    const disposers = [
      webServer.register({
        kind: 'exact',
        path: LAUNCHES_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET') {
              res.writeHead(405, { allow: 'GET' })
              res.end()
              return
            }
            const data = await fetchLaunches()
            res.writeHead(200, {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'no-store',
            })
            res.end(JSON.stringify({
              ts: data.ts,
              sourcePast: data.sourcePast,
              sourceUpcoming: data.sourceUpcoming,
              previous: data.previous.map(enrichLaunch),
              upcoming: data.upcoming.map(enrichLaunch),
            }))
          } catch (error) {
            res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
          }
        },
      }),
      webServer.register({
        kind: 'exact',
        path: PAGE_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              res.writeHead(405, { allow: 'GET' })
              res.end()
              return
            }
            const html = readPageFile()
            if (html === null) throw new Error('missing page file')
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
            res.end(req.method === 'HEAD' ? undefined : html)
          } catch {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
            res.end('未找到火箭监测页（包内 assets/rocket-launch-monitor.html 缺失）')
          }
        },
      }),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'launch-panel: launches + page routes')
}
