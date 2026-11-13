import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 头像 */
  avatar?: string;
  /** 用户名 */
  username?: string;
  /** 昵称 */
  nickname?: string;
  /** 当前登录用户的角色 */
  roles?: Array<string>;
  /** 当前登录用户的按钮级别权限 */
  permissions?: Array<string>;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";

/** "记住我"凭据存储 key（登录门户勾选"记住我"时由回跳参数落盘） */
export const REMEMBER_CREDS_KEY = "peidi-userInfo";

/** 登录态作用域：persist 关浏览器仍登录（记住我）；session 关浏览器即失效 */
export type LoginScope = "persist" | "session";

export type RememberedCreds = { username: string; password: string };

/** 读取"记住我"凭据；结构非法时视为没有 */
export function getRememberedCreds(): RememberedCreds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMEMBER_CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedCreds> | null;
    if (
      typeof parsed?.username === "string" &&
      typeof parsed?.password === "string" &&
      parsed.username &&
      parsed.password
    ) {
      return { username: parsed.username, password: parsed.password };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** 保存"记住我"凭据 */
export function saveRememberedCreds(creds: RememberedCreds): void {
  try {
    localStorage.setItem(REMEMBER_CREDS_KEY, JSON.stringify(creds));
  } catch {
    /* ignore */
  }
}

/** 清除"记住我"凭据（退出登录、凭据失效时调用） */
export function clearRememberedCreds(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REMEMBER_CREDS_KEY);
  } catch {
    /* ignore */
  }
}
/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`、`refreshToken`这三条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`avatar`、`username`、`nickname`、`roles`、`permissions`、`refreshToken`、`expires`这七条信息放在key值为`user-info`的localStorage里（利用`multipleTabsKey`当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo<Date>, scope: LoginScope = "persist") {
  let expires = 0;
  // const { accessToken, refreshToken } = data;
  const accessToken = data;
  const { loginDay } = useUserStoreHook();
  const currentDate = new Date();
  // 记住我：与 loginDay 保持一致；不记住：cookie 本身随会话销毁，这里的 expires 仅作兜底
  currentDate.setDate(
    currentDate.getDate() + (scope === "persist" ? loginDay : 1)
  );
  expires = currentDate.getTime();
  // expires = new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可
  const cookieString = JSON.stringify({ accessToken, expires });

  // persist 写持久 Cookie；session 不设 expires，关闭浏览器自动销毁
  const cookieOptions = scope === "persist" ? { expires: loginDay } : {};

  Cookies.set(TokenKey, cookieString, cookieOptions);

  Cookies.set(multipleTabsKey, "true", cookieOptions);

  function setUserKey({ avatar, username, nickname, roles, permissions }) {
    useUserStoreHook().SET_AVATAR(avatar);
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_NICKNAME(nickname);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_PERMS(permissions);
    storageLocal().setItem(userKey, {
      // refreshToken,
      expires,
      avatar,
      username,
      nickname,
      roles,
      permissions
    });
  }

  if (data.username && data.roles) {
    const { username, roles } = data;
    setUserKey({
      avatar: data?.avatar ?? "",
      username,
      nickname: data?.nickname ?? "",
      roles,
      permissions: data?.permissions ?? []
    });
  } else {
    const avatar =
      storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "";
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const nickname =
      storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    const permissions =
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [];
    setUserKey({
      avatar,
      username,
      nickname,
      roles,
      permissions
    });
  }
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  // return "Bearer " + token;
  return token;
};

/** 是否有按钮级别的权限（根据登录接口返回的`permissions`字段进行判断）*/
export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};
