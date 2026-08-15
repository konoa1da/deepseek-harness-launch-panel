// 中文显示层（Node half）：火箭型号/状态/轨道/发射场/国家 的中文映射 + 发射条目富化。
// 纯函数、零宿主依赖，可单测。client 直接消费富化后的 zh 字段，不再内置词典。

export const COUNTRY = {
  CHN: { name: '中国', flag: '🇨🇳' }, USA: { name: '美国', flag: '🇺🇸' },
  RUS: { name: '俄罗斯', flag: '🇷🇺' }, FRA: { name: '法国', flag: '🇫🇷' },
  JPN: { name: '日本', flag: '🇯🇵' }, IND: { name: '印度', flag: '🇮🇳' },
  KAZ: { name: '哈萨克斯坦', flag: '🇰🇿' }, IRN: { name: '伊朗', flag: '🇮🇷' },
  ISR: { name: '以色列', flag: '🇮🇱' }, KOR: { name: '韩国', flag: '🇰🇷' },
  NZL: { name: '新西兰', flag: '🇳🇿' }, GUF: { name: '法属圭亚那', flag: '🇬🇫' },
  AUS: { name: '澳大利亚', flag: '🇦🇺' }, DEU: { name: '德国', flag: '🇩🇪' },
  GBR: { name: '英国', flag: '🇬🇧' }, BRA: { name: '巴西', flag: '🇧🇷' },
  ESP: { name: '西班牙', flag: '🇪🇸' }, ITA: { name: '意大利', flag: '🇮🇹' },
  CAN: { name: '加拿大', flag: '🇨🇦' }, UKR: { name: '乌克兰', flag: '🇺🇦' },
}

const STATUS_ZH = {
  'launch successful': '发射成功', 'success': '发射成功',
  'launch failure': '发射失败', 'failure': '发射失败',
  'go for launch': '待发射', 'go': '待发射',
  'in flight': '飞行中', 'to be determined': '待定', 'tbd': '待定',
  'partial failure': '部分失败', 'launch was a partial failure': '部分失败',
}

const ROCKET_ZH = {
  'falcon9': '猎鹰九号', 'falcon9block5': '猎鹰九号', 'falconheavy': '猎鹰重型',
  'starship': '星舰', 'starshipsuperheavy': '星舰 · 超重',
  'soyuz21a': '联盟 2.1a', 'soyuz21b': '联盟 2.1b', 'soyuz2': '联盟二号', 'soyuz': '联盟号',
  'electron': '电子号', 'atlasv': '宇宙神五号', 'deltaivheavy': '德尔塔四号重型',
  'ariane5': '阿丽亚娜五号', 'ariane6': '阿丽亚娜六号', 'ariane62': '阿丽亚娜 62', 'ariane64': '阿丽亚娜 64',
  'vulcancentaur': '火神半人马座', 'vulcan': '火神',
  'newglenn': '新格伦', 'newshepard': '新谢泼德',
  'protonm': '质子 M', 'proton': '质子号', 'angaraa5': '安加拉 A5', 'angara': '安加拉',
  'vega': '织女星', 'vegac': '织女星 C',
  'fireflyalpha': '萤火虫阿尔法', 'minotaur1': '米诺陶一号', 'minotauriv': '米诺陶四号',
  'antares': '安塔瑞斯', 'antares230': '安塔瑞斯 230',
  'gslv': 'GSLV', 'pslv': 'PSLV', 'lvm3': 'LVM3', 'h3': 'H3', 'h2a': 'H-IIA',
  'epsilons': '艾普斯龙 S', 'epsilon': '艾普斯龙',
  'launcherone': '发射者一号', 'astra': '阿斯特拉', 'terran1': '人族一号', 'miura1': '缪拉一号',
  'longmarch': '长征',
  'longmarch2c': '长征二号丙', 'longmarch2d': '长征二号丁', 'longmarch2f': '长征二号F',
  'longmarch3b': '长征三号乙', 'longmarch3be': '长征三号乙', 'longmarch3c': '长征三号丙',
  'longmarch4b': '长征四号乙', 'longmarch4c': '长征四号丙',
  'longmarch5': '长征五号', 'longmarch5b': '长征五号B',
  'longmarch6': '长征六号', 'longmarch6a': '长征六号改', 'longmarch6c': '长征六号丙',
  'longmarch7': '长征七号', 'longmarch7a': '长征七号甲', 'longmarch8': '长征八号',
  'longmarch11': '长征十一号',
  'zhuque': '朱雀', 'zhuque2': '朱雀二号', 'zhuque3': '朱雀三号', 'zq2': '朱雀二号', 'zq3': '朱雀三号',
  'tianlong': '天龙', 'tianlong2': '天龙二号', 'tianlong3': '天龙三号',
  'jielong1': '捷龙一号', 'jielong3': '捷龙三号', 'smartdragon1': '捷龙一号', 'smartdragon': '捷龙', 'smartdragon3': '捷龙三号',
  'kuaizhou1': '快舟一号', 'kuaizhou1a': '快舟一号甲', 'kuaizhou11': '快舟十一号',
  'ceres1': '谷神星一号', 'ceres1s': '谷神星一号S', 'pallas1': '智神星一号',
  'hyperbola1': '双曲线一号', 'hyperbola2': '双曲线二号', 'hyperbola3': '双曲线三号', 'sqx1': '双曲线一号',
  'gravity1': '引力一号', 'gravity2': '引力二号',
  'lijian1': '力箭一号', 'kinetica1': '力箭一号',
  'nebula1': '星云一号', 'tianxing1': '天行一号', 'zhongke1a': '中科一号甲',
}

const ORBIT_ZH = {
  'low earth orbit': '近地轨道 (LEO)',
  'medium earth orbit': '中地球轨道 (MEO)',
  'geosynchronous orbit': '地球同步轨道 (GSO)',
  'geostationary orbit': '地球静止轨道 (GEO)',
  'geostationary transfer orbit': '地球同步转移轨道 (GTO)',
  'sun-synchronous orbit': '太阳同步轨道 (SSO)',
  'polar orbit': '极地轨道',
  'high earth orbit': '高地球轨道 (HEO)',
  'suborbital': '亚轨道',
  'lunar transfer': '月球转移轨道',
  'low lunar orbit': '近月轨道',
  'lunar': '月球轨道',
  'heliocentric orbit': '日心轨道',
  'interplanetary': '行星际轨道',
  'elliptical orbit': '椭圆轨道',
}

/** RocketLaunch.Live 的两位国家码 → LL2 三位码（isDomestic 依赖 CHN）。 */
export const CC2TO3 = {
  us: 'USA', cn: 'CHN', ru: 'RUS', jp: 'JPN', in: 'IND', kz: 'KAZ', fr: 'FRA',
  nz: 'NZL', ir: 'IRN', il: 'ISR', kr: 'KOR', au: 'AUS', de: 'DEU', gb: 'GBR',
  gf: 'GUF', br: 'BRA', es: 'ESP', it: 'ITA', ca: 'CAN', ua: 'UKR', tw: 'TWN',
}

const norm = (s) => String(s || '').toLowerCase().replace(/[\s\-–—/.]/g, '')

/** 阿拉伯数字 → 中文数字（支持多位数：12 → 十二）。 */
function cnNumber(n) {
  const d = '零一二三四五六七八九'
  n = Math.floor(n)
  if (n < 0) return String(n)
  if (n < 10) return d[n]
  if (n < 20) return '十' + (n % 10 ? d[n % 10] : '')
  const tens = Math.floor(n / 10), ones = n % 10
  return d[tens] + '十' + (ones ? d[ones] : '')
}

/** 长征系列尾缀转写：5B → 五号B、12 → 十二号、2F → 二号F。 */
function longMarchZh(tail) {
  const m = String(tail).match(/^(\d+)(.*)$/)
  if (!m) return ''
  return '长征' + cnNumber(parseInt(m[1], 10)) + '号' + m[2].toUpperCase()
}

/** 火箭型号英文名 → 中文名（无对应时返回空串，调用方回退英文）。 */
export function rocketZh(name) {
  if (!name) return ''
  if (/[\u4e00-\u9fff]/.test(name)) return name
  let k = norm(name)
  k = k.replace(/^cz(\d)/, 'longmarch$1')   // CZ-3B / CZ-12 视同 Long March
  if (ROCKET_ZH[k]) return ROCKET_ZH[k]
  const m = k.match(/^longmarch(.+)$/)
  if (m) return longMarchZh(m[1])
  // 包含匹配兜底（真实数据常带后缀，如 "Astra Rocket 3.3" 含 "astra"）：最长键优先。
  const keys = Object.keys(ROCKET_ZH).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (k.includes(key)) return ROCKET_ZH[key]
  }
  return ''
}

/** 发射状态英文名 → 中文（无对应时保留原名）。 */
export function statusZhOf(name) {
  const k = String(name || '').toLowerCase()
  return STATUS_ZH[k] || name || '—'
}

/** 轨道英文名 → 中文（无对应时返回空串，调用方显示「未公开」）。 */
export function orbitZhOf(name) {
  return ORBIT_ZH[String(name || '').toLowerCase()] || ''
}

/** 国家代码 → { name, flag }（未知时回退代码本身）。 */
export function countryInfoOf(code) {
  return COUNTRY[code] || { name: code || '未知', flag: '🌐' }
}

/** 发射场英文名 → 中文（国内发射场重点翻译；国外保持原名）。 */
export function siteZhName(siteEn, padName, countryCode) {
  const raw = siteEn || '未公开发射场'
  if (!raw || raw === '未公开发射场') return raw
  if (/[\u4e00-\u9fff]/.test(raw)) return raw
  const s = raw.toLowerCase()
  const isChina = countryCode === 'CHN' || /wenchang|jiuquan|xichang|taiyuan|hainan|haiyang|dongfang|yellow sea|bohai/.test(s)
  let zh = ''
  if (/wenchang/.test(s)) zh = '文昌航天发射场'
  else if (/jiuquan/.test(s)) zh = '酒泉卫星发射中心'
  else if (/xichang/.test(s)) zh = '西昌卫星发射中心'
  else if (/taiyuan/.test(s)) zh = '太原卫星发射中心'
  else if (/hainan commercial|hainan/.test(s)) zh = '海南商业航天发射场'
  else if (/haiyang/.test(s)) zh = '海阳海上发射场'
  else if (/dongfang spaceport/.test(s)) zh = '东方航天港'
  else if (/yellow sea/.test(s)) zh = '黄海海上发射场'
  else if (/bohai/.test(s)) zh = '渤海海上发射场'
  if (zh) {
    const pad = (padName || '').match(/lc[-\s]?\d+/i)
    return zh + (pad ? ' · ' + pad[0].toUpperCase() : '')
  }
  if (!isChina) return raw
  return raw
    .replace(/people's republic of china|p\.r\. china|, china/gi, '')
    .replace(/satellite launch center/gi, '卫星发射中心')
    .replace(/spacecraft launch site|launch site/gi, '发射场')
    .replace(/launch center/gi, '发射中心')
    .replace(/,\s*/g, ' · ')
    .replace(/\s{2,}/g, ' ')
    .trim() || raw
}

/** 归一化发射条目 → client 直接可渲染的富化对象（含全部中文显示字段）。 */
export function enrichLaunch(l) {
  const rocketEn = l?.rocket?.configuration?.name || l?.rocket?.configuration?.full_name || l?.rocket?.name || '未知型号'
  const zh = rocketZh(rocketEn)
  const code = l?.pad?.location?.country_code || l?.pad?.country_code || ''
  const ci = countryInfoOf(code)
  const nameParts = String(l?.name || '').split('|')
  return {
    id: l?.id ?? null,
    name: l?.name || '',
    net: l?.net || null,
    status: l?.status?.name || '—',
    statusZh: statusZhOf(l?.status?.name),
    rocketEn,
    rocketZh: zh || rocketEn,
    rocketBilingual: (zh && zh !== rocketEn) ? `${zh} · ${rocketEn}` : rocketEn,
    mission: l?.mission?.name || (nameParts.length > 1 ? nameParts[1].trim() : '') || '未公开任务',
    provider: l?.launch_service_provider?.name || '',
    siteEn: l?.pad?.location?.name || l?.pad?.name || '未公开发射场',
    siteZh: siteZhName(l?.pad?.location?.name || l?.pad?.name || '', l?.pad?.name || '', code),
    country: code,
    countryName: ci.name,
    countryFlag: ci.flag,
    orbitZh: orbitZhOf(l?.mission?.orbit?.name),
    demo: !!l?.demo,
  }
}
