import { formatToken, getToken } from "@/utils/auth";
import { http } from "@/utils/http";

export const commonUrlApi = (url: string) =>
  // `${"http://12.18.1.12:8091"}${url}`;
  `${"https://api.peidigroup.cn"}${url}`;

/** 获取枚举 */
// 枚举 -docStatus -reportType
export const getCommonEnum = (type: "docStatus" | "reportType") => {
  return http.request("get", commonUrlApi("/ai/common/enum"), {
    params: {
      type
    }
  });
};

/** 设置枚举 */
export const postCommonEnum = (data: any) => {
  return http.request("post", commonUrlApi("/ai/common/enum"), {
    data
  });
};

/** 获取分页 */
export const getMilvusPage = (params: {
  pageNo: number;
  pageSize: number;
  searchStr?: string; // [{"searchName":"reportType","searchType":"equals","searchValue":"检测文档"}]
}) => {
  // mock模拟
  // return http.request<any>("get", "/ai/milvus/page");
  return http.request("get", commonUrlApi("/ai/milvus/page"), {
    params: {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
      searchStr: params.searchStr
    }
  });
};

/** 修改知识库 */
export const postMilvusUpdate = (data: Record<string, any>) => {
  return http.request("post", commonUrlApi("/ai/milvus/update"), {
    data
  });
};

/** 删除知识库 */
export const postMilvusDelete = (data: Record<string, any>) => {
  return http.request("post", commonUrlApi("/ai/milvus/delete"), {
    data
  });
};

/** 下载文件 */
export const getCommonDownload = (objectName: string) => {
  return http.request("get", commonUrlApi("/ai/common/download"), {
    params: {
      authorization: formatToken(getToken().accessToken),
      objectName
    }
  });
};

/** 获取文件url */
export const getCommonDownloadUrl = (objectName: string) => {
  return http.request("get", commonUrlApi("/ai/common/download-url"), {
    params: {
      objectName
    }
  });
};

/** 数据总览 */
export const getMilvusDashboard = () => {
  return http.request("get", commonUrlApi("/ai/milvus/dashboard"));
};
