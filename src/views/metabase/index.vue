<script setup lang="ts">
import { storageLocal } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import { getNewbiSession, createNewbiUser } from "@/api/user";
import { SYSTEM_CONFIG } from "@/constants/system";
import { set } from "nprogress";

const DD_USER_INFO: any = storageLocal().getItem("ddUserInfo");
let createAttemptCount = 0;
const MAX_CREATE_ATTEMPTS = 1;

const goToNewBI = () => {
  if (!DD_USER_INFO) {
    ElMessageBox.confirm(
      "当前没有钉钉用户信息，是否直接跳转 Metabase 登录页？",
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    ).then(() => {
      window.location.href = "https://newbi.peidigroup.cn";
    });
    return;
  }
  // 在业务前端 (pm.peidigroup.cn) 执行
  fetchNewbiSession(
    {
      username: DD_USER_INFO?.email,
      password: SYSTEM_CONFIG.NEWBI_PASSWORD
    },
    sessionId => {
      // 设置共享 Cookie
      document.cookie = `metabase.SESSION=${sessionId}; Domain=.peidigroup.cn; Path=/; SameSite=Lax`;

      // 跳转到 Metabase
      redirectToMetabaseLogin();
    }
  );
};

// 跳转 Metabase 登录页
const redirectToMetabaseLogin = () => {
  window.location.href = "https://newbi.peidigroup.cn";
};

//#region 请求相关
const fetchNewbiSession = (
  { username, password },
  callback?: (sessionId: string) => void
) => {
  getNewbiSession({ username, password })
    .then((res: any) => {
      if (res.code === 200) {
        createAttemptCount = 0; // 重置计数
        callback?.(res?.data);
      } else if (res.code === 500) {
        if (createAttemptCount >= MAX_CREATE_ATTEMPTS) {
          ElMessage.error("自动登录失败，即将跳转 Metabase 登录页...");
          createAttemptCount = 0; // 重置计数
          setTimeout(() => {
            redirectToMetabaseLogin();
          }, 1000 * 3);
          return;
        }

        const infoMsg = ElMessage({
          message: "用户没有注册，自动创建用户中...",
          duration: 0,
          type: "info"
        });

        createAttemptCount++;
        fetchCreateNewbiUser(
          {
            email: username,
            firstName: DD_USER_INFO?.name?.charAt(0) ?? "",
            lastName: DD_USER_INFO?.name?.slice(1) ?? "",
            password
          },
          () => {
            infoMsg.close();
            // 延迟 1 秒后再尝试登录，给后端一些时间完成用户创建
            setTimeout(() => {
              goToNewBI();
            }, 1000);
          }
        );
      } else {
        ElMessage.error("登录失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("登录失败:" + error.message);
    });
};

const fetchCreateNewbiUser = (
  { email, firstName, lastName, password },
  callback?: () => void
) => {
  createNewbiUser({ email, firstName, lastName, password })
    .then((res: any) => {
      if (res.code === 200) {
        ElMessage.success("创建用户成功");
        callback?.();
      } else {
        ElMessage.error("创建用户失败:" + res?.msg);
      }
    })
    .catch(error => {
      ElMessage.error("创建用户失败:" + error.message);
    });
};
//#endregion
</script>

<template>
  <div class="h-full flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Metabase 系统</h2>
      <div class="text-gray-500 mb-6">点击下方按钮进入 Metabase 登录页面</div>

      <el-button type="primary" @click="goToNewBI">进入 Metabase</el-button>
    </div>
  </div>
</template>
