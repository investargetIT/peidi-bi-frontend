import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

const commonUrlApi = (url: string) => `${"https://user.peidigroup.cn"}${url}`;

/** 登录 */
export const getLogin = (data?: object) => {
  // return http.request<UserResult>("post", "/login", { data });
  return http.request<UserResult>(
    "post",
    commonUrlApi("/user/login/password"),
    {
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
};

// 根据code拿到个人信息
export const getUserInfo = code => {
  return http.request("get", commonUrlApi(`/ding/userInfo?code=${code}`), {});
};

// 注册
export const register = data => {
  return http.request("post", commonUrlApi(`/user/email-register`), {
    data
  });
};

// 调用手机注册接口 -新版
export const registerMobile = data => {
  return http.request("post", commonUrlApi(`/user/sms-register`), {
    data
  });
};

// 获取jsapi的签名
export const getJsApi = params => {
  return http.request("get", commonUrlApi("/ding/jsapi"), {
    params
  });
};

// 判断用户是否登陆
export const getUserCheck = params => {
  return http.request("get", commonUrlApi("/user/user-check"), { params });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};
