// launch-panel 浏览器 half：右侧可折叠的火箭发射任务面板。
// 官方 bundle client 形态：纯 DOM 自渲染；关键样式 JS 内联（宿主可能清理 CSS 注入——
// 见 whale-girl 系列环境事实）；数据经 Node half 同源端点拉取（无跨域）。
// 折叠态：右侧仅剩一个向左箭头 ◀；点击箭头面板向左滑出；面板头部 ▶ 收起。
// 零依赖单文件（路由常量内联，单一来源 src/routes.mjs；构建=纯文本转换，无外部工具）。

export const name = 'launch-panel'

const LAUNCHES_PATH = '/launch-panel/launches' // 与 src/routes.mjs 的 ROUTE_PREFIX 保持同步
const STORE_KEY = 'launch-panel:open'
const POLL_MS = 5 * 60 * 1000
const TZ_BJ = 8 * 3600 * 1000

const CSS = `
[data-launch-panel] .lp-tab { display: grid; place-items: center; border: 0; background: rgba(15,17,23,.92);
  border-radius: 10px 0 0 10px; box-shadow: 0 8px 24px rgba(0,0,0,.35); cursor: pointer;
  transition: opacity .2s ease, transform .2s ease; }
[data-launch-panel] .lp-tab:hover { background: rgba(40,46,64,.96); }
[data-launch-panel] .lp-chev { color: #cdd5e4; font-size: 13px; line-height: 1; }
[data-launch-panel] .lp-panel { background: rgba(13,15,21,.94); border-left: 1px solid rgba(255,255,255,.08);
  box-shadow: -12px 0 40px rgba(0,0,0,.45); display: flex; flex-direction: column;
  transition: transform .26s cubic-bezier(.22,.68,.28,1); }
[data-launch-panel].open .lp-panel { transform: translateX(0); }
[data-launch-panel].open .lp-tab { opacity: 0; pointer-events: none; }
[data-launch-panel] .lp-head { display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.08); flex: 0 0 auto; }
[data-launch-panel] .lp-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 650; color: #eef1f6; }
[data-launch-panel] .lp-dot { width: 8px; height: 8px; border-radius: 50%; background: #5b8cff; }
[data-launch-panel] .lp-dot.offline { background: #f5a623; }
[data-launch-panel] .lp-src { font-size: 10px; color: #8a909b; background: rgba(255,255,255,.07);
  padding: 2px 7px; border-radius: 999px; font-weight: 600; letter-spacing: .5px; }
[data-launch-panel] .lp-actions { display: flex; gap: 6px; }
[data-launch-panel] .lp-btn { width: 28px; height: 28px; border: 1px solid rgba(255,255,255,.10);
  border-radius: 8px; background: rgba(255,255,255,.05); color: #cdd5e4; font-size: 13px; cursor: pointer;
  display: grid; place-items: center; line-height: 1; }
[data-launch-panel] .lp-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
[data-launch-panel] .lp-btn.spin svg { animation: lp-spin .9s linear infinite; }
@keyframes lp-spin { to { transform: rotate(360deg); } }
[data-launch-panel] .lp-scroll { flex: 1; overflow-y: auto; min-height: 0; padding: 8px 10px 12px; }
[data-launch-panel] .lp-scroll::-webkit-scrollbar { width: 8px; }
[data-launch-panel] .lp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 8px; }
[data-launch-panel] .lp-sec-label { font-size: 10.5px; letter-spacing: 2px; color: #8a909b; padding: 12px 4px 6px; }
[data-launch-panel] .lp-item { display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 10px; margin-bottom: 3px; border-radius: 10px; border: 1px solid transparent;
  cursor: default; transition: background-color .16s ease, border-color .16s ease, transform .16s ease; }
[data-launch-panel] .lp-item:hover { background: rgba(91,140,255,.14); border-color: rgba(255,255,255,.08); transform: translateX(-2px); }
[data-launch-panel] .lp-item.demo { opacity: .55; }
[data-launch-panel] .lp-left { display: flex; align-items: center; gap: 9px; min-width: 0; }
[data-launch-panel] .lp-flag { font-size: 15px; flex: 0 0 auto; }
[data-launch-panel] .lp-name { min-width: 0; }
[data-launch-panel] .lp-rocket { font-size: 13px; font-weight: 600; color: #eef1f6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-launch-panel] .lp-rocket-en { font-size: 10.5px; color: #8a909b; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
[data-launch-panel] .lp-right { text-align: right; flex: 0 0 auto; }
[data-launch-panel] .lp-date { font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 12px; color: #eef1f6; font-weight: 550; }
[data-launch-panel] .lp-code { font-size: 9.5px; color: #8a909b; letter-spacing: 1px; margin-top: 2px; font-weight: 600; }
[data-launch-panel] .lp-badge { display: inline-block; margin-top: 3px; font-size: 9.5px; letter-spacing: 1px;
  padding: 1px 7px; border-radius: 999px; background: rgba(255,255,255,.08); color: #8a909b; font-weight: 600; }
[data-launch-panel] .lp-item.domestic .lp-badge { background: rgba(91,140,255,.18); color: #9db9ff; }
[data-launch-panel] .lp-empty { color: #8a909b; font-size: 12px; padding: 16px 8px; }
[data-launch-panel] .lp-foot { flex: 0 0 auto; display: flex; justify-content: space-between;
  padding: 10px 14px; border-top: 1px solid rgba(255,255,255,.08); font-size: 10px; color: #6f7683; }
/* 底部入口：打开完整火箭监测页（同源 /launch-panel/page，页面随 npm 包分发） */
[data-launch-panel] .lp-open-page { flex: 0 0 auto; border-top: 1px solid rgba(255,255,255,.08); padding: 8px 14px; }
[data-launch-panel] .lp-open-page a { display: flex; align-items: center; gap: 7px; color: #9db9ff;
  font-size: 12px; font-weight: 600; text-decoration: none; padding: 7px 9px; border-radius: 9px;
  transition: color .15s ease, background-color .15s ease, transform .15s ease; }
[data-launch-panel] .lp-open-page a:hover { color: #cddaff; background: rgba(91,140,255,.14); transform: translateX(-2px); }
[data-launch-panel] .lp-open-page .lp-open-arrow { margin-left: auto; opacity: .7; }

/* 悬停详情卡 */
[data-launch-panel] .lp-hover { width: 288px; background: rgba(24,28,38,.97); border: 1px solid rgba(255,255,255,.10);
  border-radius: 12px; box-shadow: 0 16px 44px rgba(0,0,0,.5); padding: 14px 16px 13px; color: #eef1f6; }
[data-launch-panel] .lph-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
[data-launch-panel] .lph-status { font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 9px;
  border-radius: 999px; background: rgba(91,140,255,.18); color: #9db9ff; }
[data-launch-panel] .lph-tag { font-size: 9.5px; font-weight: 600; letter-spacing: 1px; padding: 2px 8px;
  border-radius: 999px; background: rgba(255,255,255,.08); color: #8a909b; }
[data-launch-panel] .lph-title { font-size: 15px; font-weight: 660; line-height: 1.35; margin-bottom: 2px; }
[data-launch-panel] .lph-sub { font-size: 11.5px; color: #9aa2b0; margin-bottom: 10px; }
[data-launch-panel] .lph-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px 12px; }
[data-launch-panel] .lph-cell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
[data-launch-panel] .lph-k { font-size: 9px; letter-spacing: 2px; color: #6f7683; }
[data-launch-panel] .lph-v { font-size: 11.5px; font-weight: 580; word-break: break-word; }
[data-launch-panel] .lph-v.mono { font-family: ui-monospace, "Cascadia Code", Consolas, monospace; font-size: 11px; }
[data-launch-panel] .lph-utc { font-size: 9.5px; color: #6f7683; margin-top: 1px; }
`

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const pad2 = (n) => String(n).padStart(2, '0')
const bj = (iso) => new Date(new Date(iso).getTime() + TZ_BJ)
const fmtMD = (iso) => { if (!iso) return '--'; const d = bj(iso); return `${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}` }
const fmtDT = (iso) => { if (!iso) return '—'; const d = bj(iso); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} 北京时间` }
const fmtUTC = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())} UTC` }

export function apply(ctx = {}) {
  if (document.querySelector('[data-launch-panel]') !== null) {
    console.warn('[launch-panel] 已存在实例，跳过重复挂载')
    return () => {}
  }
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)

  // ---- 骨架 ----
  const host = document.createElement('div')
  host.setAttribute('data-launch-panel', '')
  host.setAttribute('aria-label', '火箭发射任务面板')
  host.style.cssText = 'position: fixed; top: 0; right: 0; bottom: 0; z-index: 2147482900; pointer-events: none; font-family: system-ui, -apple-system, "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", sans-serif; user-select: none;'

  // 折叠箭头（闭合态：右侧竖排 ◀）
  const tab = document.createElement('button')
  tab.className = 'lp-tab'
  tab.setAttribute('aria-label', '打开发射任务面板')
  tab.style.cssText = 'position: absolute; top: 50%; right: 10px; transform: translateY(-50%); width: 30px; height: 66px; pointer-events: auto; opacity: 1; transition: opacity .2s ease;'
  tab.innerHTML = '<span class="lp-chev">◀</span>'

  // 面板
  const panel = document.createElement('div')
  panel.className = 'lp-panel'
  panel.style.cssText = 'position: absolute; top: 0; right: 0; bottom: 0; width: 320px; transform: translateX(102%); transition: transform .26s cubic-bezier(.22,.68,.28,1); pointer-events: auto;'
  panel.innerHTML = `
    <div class="lp-head">
      <div class="lp-title">
        <span class="lp-dot"></span><span>火箭发射任务</span>
        <span class="lp-src" id="lp-src">—</span>
      </div>
      <div class="lp-actions">
        <button class="lp-btn lp-refresh" title="立即刷新" aria-label="刷新">↻</button>
        <button class="lp-btn lp-collapse" title="收起面板" aria-label="收起">▶</button>
      </div>
    </div>
    <div class="lp-scroll">
      <div class="lp-sec-label">即将发射</div>
      <div class="lp-list lp-up"></div>
      <div class="lp-sec-label">已发射 · 近 30 天</div>
      <div class="lp-list lp-past"></div>
    </div>
    <div class="lp-foot">
      <span class="lp-updated">最后更新 —</span>
      <span>每 5 分钟刷新</span>
    </div>
    <div class="lp-open-page">
      <a href="/launch-panel/page" target="_blank" rel="noopener" title="打开完整火箭监测页">
        <span>🚀 打开完整火箭监测页</span><span class="lp-open-arrow">↗</span>
      </a>
    </div>`

  // 悬停详情卡（浮层）
  const hover = document.createElement('div')
  hover.className = 'lp-hover'
  hover.style.cssText = 'position: fixed; display: none; pointer-events: none; z-index: 2147483000;'

  document.body.append(host)
  host.append(tab, panel, hover)

  const $ = (sel) => panel.querySelector(sel)
  const dot = $('.lp-dot')
  const srcLabel = $('#lp-src')
  const upList = $('.lp-up')
  const pastList = $('.lp-past')
  const updatedEl = $('.lp-updated')
  const refreshBtn = $('.lp-refresh')

  // ---- 状态 ----
  let data = { previous: [], upcoming: [], sourcePast: 'demo', sourceUpcoming: 'demo', ts: 0 }
  let pollTimer = null
  let refreshing = false

  // ---- 开合 ----
  // 关键样式 JS 内联控制：CSS 类规则无法覆盖内联 transform（面板初始 translateX(102%)
  // 是内联样式，类规则 .open 的 translateX(0) 会被内联压过——必须由 JS 改写内联值）。
  const setOpen = (v) => {
    host.classList.toggle('open', v)
    panel.style.transform = v ? 'translateX(0)' : 'translateX(102%)'
    tab.style.opacity = v ? '0' : '1'
    tab.style.pointerEvents = v ? 'none' : 'auto'
    try { localStorage.setItem(STORE_KEY, v ? '1' : '0') } catch { /* 隐私模式忽略 */ }
    if (v) refresh()
  }
  tab.addEventListener('click', () => setOpen(true))
  panel.querySelector('.lp-collapse').addEventListener('click', () => setOpen(false))
  try { if (localStorage.getItem(STORE_KEY) === '1') setOpen(true) } catch { /* 隐私模式忽略 */ }

  // ---- 悬停详情 ----
  const showHover = (item) => {
    const list = item.dataset.sec === 'up' ? data.upcoming : data.previous
    const l = list[+item.dataset.i]
    if (!l) return
    const isUp = item.dataset.sec === 'up'
    hover.innerHTML = `
      <div class="lph-top">
        <span class="lph-status">${esc(l.statusZh)}</span>
        <span class="lph-tag">${l.demo ? '演示数据' : (isUp ? '即将发射' : '已发射')}</span>
      </div>
      <div class="lph-title">${esc(l.mission)}</div>
      <div class="lph-sub">${esc(l.rocketBilingual)}${l.provider ? ' · ' + esc(l.provider) : ''}</div>
      <div class="lph-grid">
        <div class="lph-cell"><span class="lph-k">发射时间</span>
          <span class="lph-v mono">${esc(fmtDT(l.net))}</span>
          <span class="lph-utc">${esc(fmtUTC(l.net))}</span></div>
        <div class="lph-cell"><span class="lph-k">发射场</span><span class="lph-v">${esc(l.siteZh)}</span></div>
        <div class="lph-cell"><span class="lph-k">所属国家</span><span class="lph-v">${l.countryFlag} ${esc(l.countryName)}${l.country ? ' · ' + esc(l.country) : ''}</span></div>
        <div class="lph-cell"><span class="lph-k">目标轨道</span><span class="lph-v">${esc(l.orbitZh || '未公开')}</span></div>
      </div>`
    hover.style.display = 'block'
    const r = item.getBoundingClientRect()
    const w = hover.offsetWidth || 288
    const h = hover.offsetHeight || 240
    let left = r.left - w - 10                       // 面板在右侧 → 详情卡放在条目左侧
    if (left < 10) left = r.right + 10
    let top = r.top
    if (top + h > window.innerHeight - 10) top = Math.max(10, window.innerHeight - h - 10)
    hover.style.left = `${Math.max(10, left)}px`
    hover.style.top = `${Math.max(10, top)}px`
  }
  const hideHover = () => { hover.style.display = 'none' }
  panel.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.lp-item')
    if (item) showHover(item)
  })
  panel.addEventListener('mouseout', (e) => {
    if (e.target.closest('.lp-item') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.lp-item'))) hideHover()
  })
  window.addEventListener('scroll', hideHover, true)

  // ---- 渲染 ----
  const itemHTML = (l, sec) => {
    const isUp = sec === 'up'
    const date = isUp ? `${fmtMD(l.net)} ${pad2(bj(l.net).getUTCHours())}:${pad2(bj(l.net).getUTCMinutes())}` : fmtMD(l.net)
    const badge = l.demo ? '演示' : (isUp ? '即将' : '完成')
    return `
      <div class="lp-item ${l.country === 'CHN' ? 'domestic' : ''}${l.demo ? ' demo' : ''}" data-sec="${sec}" data-i="${isUp ? data.upcoming.indexOf(l) : data.previous.indexOf(l)}" title="${esc(l.rocketBilingual)} · ${esc(l.mission)}">
        <div class="lp-left">
          <span class="lp-flag">${l.countryFlag}</span>
          <div class="lp-name">
            <div class="lp-rocket">${esc(l.rocketZh)}</div>
            <div class="lp-rocket-en">${esc(l.rocketEn)}</div>
          </div>
        </div>
        <div class="lp-right">
          <div class="lp-date">${esc(date)}</div>
          <div class="lp-code">${esc(l.country || '—')}</div>
          <span class="lp-badge">${badge}</span>
        </div>
      </div>`
  }

  const render = () => {
    const now = Date.now()
    const pastMonth = data.previous.filter((l) => {
      const t = new Date(l.net).getTime()
      return Number.isFinite(t) && t >= now - 30 * 24 * 60 * 60 * 1000
    })
    const pastShown = pastMonth.length >= 3 ? pastMonth : data.previous.slice(0, 12)
    upList.innerHTML = data.upcoming.length
      ? data.upcoming.map((l) => itemHTML(l, 'up')).join('')
      : '<div class="lp-empty">暂无即将发射的任务。</div>'
    pastList.innerHTML = pastShown.length
      ? pastShown.map((l) => itemHTML(l, 'past')).join('')
      : '<div class="lp-empty">暂无近一月发射记录。</div>'

    // 状态指示
    const livePast = data.sourcePast !== 'demo'
    const liveUp = data.sourceUpcoming !== 'demo'
    const allLive = livePast && liveUp
    const srcNames = { ll2: 'LL2', rll: 'RLL' }
    const src = [...new Set([
      livePast ? srcNames[data.sourcePast] : null,
      liveUp ? srcNames[data.sourceUpcoming] : null,
    ].filter(Boolean))].join(' + ')
    dot.classList.toggle('offline', !allLive)
    srcLabel.textContent = allLive ? (src || '实时') : (livePast || liveUp ? '部分离线' : '离线演示')
    updatedEl.textContent = `最后更新 ${new Date(data.ts).toLocaleTimeString('zh-CN', { hour12: false })}`
  }

  // ---- 数据 ----
  const refresh = async () => {
    if (refreshing) return
    refreshing = true
    refreshBtn.classList.add('spin')
    try {
      const res = await fetch(LAUNCHES_PATH)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      if (body && Array.isArray(body.previous) && Array.isArray(body.upcoming)) {
        data = body
        render()
      }
    } catch (err) {
      dot.classList.add('offline')
      srcLabel.textContent = '服务未就绪'
      srcLabel.title = `无法获取数据：${err.message}（插件已启用但 web 需重启？）`
    } finally {
      refreshing = false
      refreshBtn.classList.remove('spin')
    }
  }
  refreshBtn.addEventListener('click', () => refresh())

  // ---- 生命周期 ----
  if (host.classList.contains('open')) refresh()
  pollTimer = setInterval(() => { if (host.classList.contains('open')) refresh() }, POLL_MS)

  return () => {
    clearInterval(pollTimer)
    host.remove()
    style.remove()
  }
}
