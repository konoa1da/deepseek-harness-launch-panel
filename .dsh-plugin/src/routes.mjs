// 路由前缀单一来源：client 与 Node half 共用同一前缀，改前缀只改这里。
// 零依赖纯常量：client bundle（构建内联）与 Node half 都可 import。
export const ROUTE_PREFIX = '/launch-panel'
export const LAUNCHES_PATH = `${ROUTE_PREFIX}/launches`
export const PAGE_PATH = `${ROUTE_PREFIX}/page`
