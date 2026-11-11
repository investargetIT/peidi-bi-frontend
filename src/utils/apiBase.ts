/**
 * 接口基础地址统一配置
 *
 * 支持三种环境：
 * - prod   生产：https://api.peidigroup.cn
 * - local1 本地接口1：http://12.18.1.36:8085
 * - local2 本地接口2：http://10.162.250.167:9000
 *
 * 切换方式（优先级从高到低）：
 * 1. URL 参数：http://localhost:8848/?apiEnv=local2#/douyin/index
 * 2. localStorage：localStorage.setItem("api-env", "local2")
 * 3. 环境变量：.env.development 中配置 VITE_API_ENV = local2
 * 4. 默认：prod
 *
 * 开发环境控制台辅助：apiEnv.set("local2")、apiEnv.get()、apiEnv.list、apiEnv.reset()
 * 开发环境快捷键：Ctrl+Shift+1 本地1、Ctrl+Shift+2 本地2、Ctrl+Shift+0 生产
 */
export type ApiEnv = "prod" | "local1" | "local2";

export const API_BASE_MAP: Record<ApiEnv, string> = {
  prod: "https://api.peidigroup.cn",
  local1: "http://12.18.1.36:8085",
  local2: "http://10.162.250.167:9000"
};

const STORAGE_KEY = "api-env";
const QUERY_KEY = "apiEnv";

const isApiEnv = (val: unknown): val is ApiEnv =>
  val === "prod" || val === "local1" || val === "local2";

/** 读取 URL 参数（兼容 hash 路由：/#/douyin/index?apiEnv=local2） */
const readQueryEnv = (url: URL): string | null => {
  const searchVal = url.searchParams.get(QUERY_KEY);
  if (searchVal) {
    url.searchParams.delete(QUERY_KEY);
    return searchVal;
  }
  const hashIndex = url.hash.indexOf("?");
  if (hashIndex === -1) return null;
  const hashParams = new URLSearchParams(url.hash.slice(hashIndex + 1));
  const hashVal = hashParams.get(QUERY_KEY);
  if (!hashVal) return null;
  hashParams.delete(QUERY_KEY);
  const rest = hashParams.toString();
  url.hash = url.hash.slice(0, hashIndex) + (rest ? `?${rest}` : "");
  return hashVal;
};

/** 读取当前接口环境：URL 参数 > localStorage > 环境变量 > 生产 */
export const getApiEnv = (): ApiEnv => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    const query = readQueryEnv(url);
    if (isApiEnv(query)) {
      localStorage.setItem(STORAGE_KEY, query);
      // 参数只生效一次，避免切换后刷新又被 URL 参数覆盖
      window.history.replaceState(null, "", url.toString());
      return query;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isApiEnv(saved)) return saved;
  }
  return isApiEnv(import.meta.env.VITE_API_ENV)
    ? import.meta.env.VITE_API_ENV
    : "prod";
};

/** 当前接口基础地址 */
export const getApiBase = (): string => API_BASE_MAP[getApiEnv()];

/** 拼接完整接口地址 */
export const withApiBase = (url: string): string => `${getApiBase()}${url}`;

/** 运行时切换接口环境（写入 localStorage，刷新后仍然生效） */
export const setApiEnv = (env: ApiEnv): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, env);
  }
  console.info(`[api] 已切换接口环境：${env} -> ${API_BASE_MAP[env]}`);
};

/** 清除本地选择，回退到环境变量 / 生产环境 */
export const resetApiEnv = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/** 开发环境：控制台辅助 + 快捷键，页面不展示任何切换入口 */
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const apiWindow = window as Window & {
    __apiEnvBound?: boolean;
    apiEnv?: Record<string, unknown>;
  };

  if (!apiWindow.__apiEnvBound) {
    apiWindow.__apiEnvBound = true;
    apiWindow.apiEnv = {
      get: getApiEnv,
      list: API_BASE_MAP,
      set: (env: ApiEnv) => {
        setApiEnv(env);
        window.location.reload();
      },
      reset: () => {
        resetApiEnv();
        window.location.reload();
      }
    };

    // Ctrl+Shift+1 本地1 / Ctrl+Shift+2 本地2 / Ctrl+Shift+0 生产
    const shortcutMap: Record<string, ApiEnv> = {
      "1": "local1",
      "2": "local2",
      "0": "prod"
    };
    window.addEventListener("keydown", event => {
      if (!event.ctrlKey || !event.shiftKey) return;
      const env = shortcutMap[event.key];
      if (!env) return;
      event.preventDefault();
      setApiEnv(env);
      window.location.reload();
    });
  }
}
