import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
// 暂时不启用动态路由
  return new Promise<Result>((resolve, reject) => {
    resolve({
      success: true,
      data: []
    });
  });
  return http.request<Result>("get", "/get-async-routes");
};
