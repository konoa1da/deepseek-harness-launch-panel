// 发射数据源（Node half，服务端直连无 CORS 限制）：
// 分节独立降级链：Launch Library 2 → RocketLaunch.Live → 上次成功数据 → 内置演示数据。
// 内存缓存 5 分钟（client 每 5 分钟轮询 + 手动刷新，缓存防重复打爆限流）。
import { CC2TO3 } from './zh.mjs'

const LL2_BASE = 'https://ll.thespacedevs.com/2.2.0/launch/'
const RLL_PAST = 'https://fdo.rocketlaunch.live/json/launches/previous/40'
const RLL_NEXT = 'https://fdo.rocketlaunch.live/json/launches/next/8'
const CACHE_TTL = 5 * 60 * 1000
// LL2 匿名限流较严（429 后 retry-after 可达数十分钟）：收到 429 后冷却一段时间，
// 期间跳过 LL2 直接走 RLL，避免反复重试雪崩式触发限流。
const LL2_COOLDOWN_MS = 15 * 60 * 1000
const FETCH_TIMEOUT = 12000

let cache = null
let cacheAt = 0
let ll2CooldownUntil = 0
// 上次成功（非纯演示）数据：双源都失败时兜底返回，避免面板闪"离线"。
let lastGood = null

async function fetchJSON(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'launch-panel/0.1 (+https://github.com/deepseek-ai/deepseek-harness)' },
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** RocketLaunch.Live 条目 → 内部归一化形状（与 LL2 对齐）。RLL 时间字段为秒级 Unix 时间戳（数字或数字字符串）。 */
function rllToLaunch(l) {
  const c2 = String(l?.pad?.location?.country || '').toLowerCase()
  const v = l?.vehicle?.name || '未知型号'
  let net = l?.sort_date ?? l?.win_open ?? l?.win_close ?? null
  if (typeof net === 'string' && /^\d+$/.test(net)) net = Number(net)
  if (typeof net === 'number') net = (net > 1e11 ? net : net * 1000) // 秒 → 毫秒
  net = typeof net === 'number' ? new Date(net).toISOString() : net
  return {
    name: l?.name || '',
    net,
    status: { name: l?.status?.name || '—' },
    rocket: { configuration: { name: v, full_name: v, family: v } },
    pad: {
      location: {
        name: l?.pad?.location?.name || l?.pad?.name || '未公开发射场',
        country_code: CC2TO3[c2] || (c2 ? c2.toUpperCase() : ''),
      },
    },
    launch_service_provider: { name: l?.provider?.name || '' },
    mission: { name: l?.mission?.name || '', orbit: { name: l?.mission?.type || '' } },
  }
}

/** 内置演示数据（相对当前时刻生成；离线兜底，条目带 demo 标记）。 */
function demoData() {
  const now = Date.now()
  const mk = (daysAgo, name, rocket, family, country, site, provider, mission, orbit, status = 'Launch Successful') => ({
    name,
    net: new Date(now - daysAgo * 864e5).toISOString(),
    status: { name: status },
    rocket: { configuration: { name: rocket, full_name: rocket, family } },
    pad: { location: { name: site, country_code: country } },
    launch_service_provider: { name: provider },
    mission: { name: mission, orbit: { name: orbit } },
  })
  return {
    previous: [
      mk(1, '长征五号B | 天舟八号', 'Long March 5B', 'Long March', 'CHN', 'Wenchang Satellite Launch Center', '中国航天科技集团', '天舟八号货运飞船', 'Low Earth Orbit'),
      mk(4, 'Falcon 9 Block 5 | Starlink G6-71', 'Falcon 9 Block 5', 'Falcon', 'USA', 'Cape Canaveral, FL, USA', 'SpaceX', 'Starlink Group 6-71', 'Low Earth Orbit'),
      mk(7, '长征二号F | 神舟十八号', 'Long March 2F', 'Long March', 'CHN', 'Jiuquan Satellite Launch Center', '中国航天科技集团', '神舟十八号载人飞船', 'Low Earth Orbit'),
      mk(10, 'Soyuz 2.1a | Progress MS-29', 'Soyuz 2.1a', 'Soyuz', 'RUS', 'Baikonur Cosmodrome, Republic of Kazakhstan', 'Roscosmos', 'Progress MS-29', 'Low Earth Orbit'),
      mk(13, 'Falcon 9 Block 5 | NROL-167', 'Falcon 9 Block 5', 'Falcon', 'USA', 'Vandenberg SFB, CA, USA', 'SpaceX', 'NROL-167', 'Low Earth Orbit'),
      mk(16, '长征三号乙 | 北斗导航卫星', 'Long March 3B/E', 'Long March', 'CHN', 'Xichang Satellite Launch Center', '中国航天科技集团', '北斗三号导航卫星', 'Geostationary Transfer Orbit'),
      mk(20, 'Electron | Capella Acadia 5', 'Electron', 'Electron', 'NZL', 'Rocket Lab LC-1B, Mahia, New Zealand', 'Rocket Lab', 'Capella Acadia 5', 'Sun-Synchronous Orbit'),
      mk(24, 'Falcon Heavy | GOES-U', 'Falcon Heavy', 'Falcon', 'USA', 'Kennedy Space Center, FL, USA', 'SpaceX', 'GOES-U', 'Geostationary Transfer Orbit'),
    ],
    upcoming: [
      { name: '长征六号 | 试验卫星', net: new Date(now + 2 * 864e5 + 7 * 36e5).toISOString(), status: { name: 'Go' }, rocket: { configuration: { name: 'Long March 6', full_name: 'Long March 6', family: 'Long March' } }, pad: { location: { name: 'Taiyuan Satellite Launch Center', country_code: 'CHN' } }, launch_service_provider: { name: '中国航天科技集团' }, mission: { name: '试验卫星', orbit: { name: 'Sun-Synchronous Orbit' } } },
      { name: 'Starship | IFT-5', net: new Date(now + 5 * 864e5).toISOString(), status: { name: 'Go' }, rocket: { configuration: { name: 'Starship', full_name: 'Starship / Super Heavy', family: 'Starship' } }, pad: { location: { name: 'Starbase, TX, USA', country_code: 'USA' } }, launch_service_provider: { name: 'SpaceX' }, mission: { name: 'Integrated Flight Test 5', orbit: { name: 'Suborbital' } } },
    ],
  }
}

const timeSort = (asc) => (a, b) => {
  const ta = new Date(a.net).getTime()
  const tb = new Date(b.net).getTime()
  const va = Number.isFinite(ta) ? ta : (asc ? Infinity : -Infinity)
  const vb = Number.isFinite(tb) ? tb : (asc ? Infinity : -Infinity)
  return asc ? va - vb : vb - va
}

/** 判定任务是否已发射：计划时间已过，或状态已为发射后状态（success/failure/in flight）。 */
function isLaunched(l, now) {
  const t = new Date(l.net).getTime()
  if (Number.isFinite(t) && t <= now) return true
  const s = String(l?.status?.name || '').toLowerCase()
  return /success|failure|in flight|partial failure/.test(s)
}

/** 拉取近一月已发射 + 即将发射（分节独立降级，统一排序）。 */
export async function fetchLaunches() {
  const now = Date.now()
  if (cache !== null && now - cacheAt < CACHE_TTL) return cache

  let previous = [], upcoming = []
  let sourcePast = 'demo', sourceUpcoming = 'demo'

  // —— 已发射 ——
  if (now >= ll2CooldownUntil) {
    try {
      const p = await fetchJSON(`${LL2_BASE}previous/?limit=40&ordering=-net`)
      if (p && Array.isArray(p.results) && p.results.length) { previous = p.results; sourcePast = 'll2' }
    } catch (e) {
      if (e.status === 429) ll2CooldownUntil = now + LL2_COOLDOWN_MS
    }
  }
  if (sourcePast === 'demo') {
    try {
      const r = await fetchJSON(RLL_PAST)
      const list = r?.result ?? r
      if (Array.isArray(list) && list.length) { previous = list.map(rllToLaunch); sourcePast = 'rll' }
    } catch { /* 回退演示 */ }
  }

  // —— 即将发射 ——
  if (now >= ll2CooldownUntil) {
    try {
      const u = await fetchJSON(`${LL2_BASE}upcoming/?limit=8&ordering=net`)
      if (u && Array.isArray(u.results) && u.results.length) { upcoming = u.results; sourceUpcoming = 'll2' }
    } catch (e) {
      if (e.status === 429) ll2CooldownUntil = now + LL2_COOLDOWN_MS
    }
  }
  if (sourceUpcoming === 'demo') {
    try {
      const r = await fetchJSON(RLL_NEXT)
      const list = r?.result ?? r
      if (Array.isArray(list) && list.length) { upcoming = list.map(rllToLaunch); sourceUpcoming = 'rll' }
    } catch { /* 回退演示 */ }
  }

  // —— 兜底：双源失败时优先用上次成功数据（stale），而不是直接跳演示 ——
  if (previous.length === 0 && lastGood && lastGood.previous.length) {
    previous = lastGood.previous; sourcePast = lastGood.sourcePast
  }
  if (upcoming.length === 0 && lastGood && lastGood.upcoming.length) {
    upcoming = lastGood.upcoming; sourceUpcoming = lastGood.sourceUpcoming
  }
  if (previous.length === 0) { previous = demoData().previous; sourcePast = 'demo' }
  if (upcoming.length === 0) { upcoming = demoData().upcoming; sourceUpcoming = 'demo' }

  // —— 已发射归类：upcoming 中计划时间已过（或状态已为发射后）的任务立即归入已发射列表 ——
  // 上游 upcoming 接口的状态/时间更新有延迟，不处理会出现"已发射任务还挂在即将发射栏"。
  // 并入时按 id/name+net 去重：该任务已在 previous（上游 previous 接口）则不再重复并入。
  const seenIds = new Set(previous.map(l => l.id ?? `${l.name}|${l.net}`))
  const launchedFromUpcoming = []
  upcoming = upcoming.filter((l) => {
    if (!isLaunched(l, now)) return true
    const k = l.id ?? `${l.name}|${l.net}`
    if (seenIds.has(k)) return false
    seenIds.add(k)
    launchedFromUpcoming.push(l)
    return false
  })
  if (sourceUpcoming === 'demo') launchedFromUpcoming.forEach(l => { l.demo = true })
  if (launchedFromUpcoming.length) previous.push(...launchedFromUpcoming)

  previous.sort(timeSort(false))
  upcoming.sort(timeSort(true))
  if (sourcePast === 'demo') {
    previous.forEach(l => { if (!launchedFromUpcoming.includes(l)) l.demo = true })
  }

  cache = { previous, upcoming, sourcePast, sourceUpcoming, ts: now }
  cacheAt = now
  // 记录非纯演示数据，供下次双源全失败时 stale 兜底（避免面板闪"离线"）
  if (sourcePast !== 'demo' || sourceUpcoming !== 'demo') {
    lastGood = { previous: previous.slice(), upcoming: upcoming.slice(), sourcePast, sourceUpcoming }
  }
  return cache
}
