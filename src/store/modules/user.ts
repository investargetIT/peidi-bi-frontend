import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type UserResult,
  type RefreshTokenResult,
  getLogin,
  refreshTokenApi
} from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import {
  type DataInfo,
  setToken,
  removeToken,
  userKey,
  getRememberedCreds,
  clearRememberedCreds
} from "@/utils/auth";

/** "记住我"静默重登单飞，避免并发请求同时触发多个登录 */
let reloginInFlight: Promise<boolean> | null = null;

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入；remember=false 时 token 只在本次浏览器会话内有效 */
    async loginByUsername({ username, password, remember = true }) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin({ username, password })
          .then(data => {
            if (data?.success) {
              setToken(data.data, remember ? "persist" : "session");
            }
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /**
     * 用"记住我"凭据静默重登（token 过期时调用）。
     * 凭据失效（改密 / 账号被禁用等）：清掉凭据并返回 false，由调用方回退登录门户，
     * 避免拿着废凭据反复重试形成"登录 → 被踢 → 再登录"的循环。
     */
    async reloginWithRemembered(): Promise<boolean> {
      const creds = getRememberedCreds();
      if (!creds) return false;
      if (reloginInFlight) return reloginInFlight;

      reloginInFlight = this.loginByUsername({ ...creds, remember: true })
        .then(res => !!res?.success)
        .catch(() => false)
        .then(ok => {
          if (!ok) clearRememberedCreds();
          return ok;
        })
        .finally(() => {
          reloginInFlight = null;
        });

      return reloginInFlight;
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      // 统一登录状态凭据删除
      storageLocal().removeItem("peidi-userInfo");
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
