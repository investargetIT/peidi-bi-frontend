import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import { useI18n } from "@/plugins/i18n";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
// import { useEcharts } from "@/plugins/echarts";
import { createApp, ref, type Directive } from "vue";
import { useElementPlus } from "@/plugins/elementPlus";
import { injectResponsiveStorage } from "@/utils/responsive";

import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

// 导入自定义el-tabs样式
import "./style/pd-el-tabs.scss";

import pdGlobalComponent from "pd-ui-package";

class PdLocale {
  static getLocale() {
    // 适配当前项目的中英文参数 zh / en
    let locale = "zh";
    try {
      const storedData = localStorage.getItem("responsive-locale");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        locale = parsed?.locale || "zh";
      }
    } catch (error) {
      locale = "zh";
    }
    return PdLocale.justifyLocale(locale);
  }
  static changeLocale(newLocale: string) {
    currentLocale.value = PdLocale.justifyLocale(newLocale);
  }
  static justifyLocale(locale: string) {
    if (locale === "zh") {
      return "zh-cn";
    } else {
      return "en";
    }
  }
}

// 创建响应式的语言状态
const currentLocale = ref(PdLocale.getLocale());

const app = createApp(App);
app.use(pdGlobalComponent, {
  locale: () => currentLocale.value
});
// 注册到全局变量
app.config.globalProperties.$changeLocale = PdLocale.changeLocale; // 挂载全局

// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册@iconify/vue图标库
import {
  IconifyIconOffline,
  IconifyIconOnline,
  FontIcon
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
import { Perms } from "@/components/RePerms";
app.component("Auth", Auth);
app.component("Perms", Perms);

// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
app.use(VueTippy);

getPlatformConfig(app).then(async config => {
  setupStore(app);
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  app.use(MotionPlugin).use(useI18n).use(useElementPlus).use(Table);
  // .use(PureDescriptions)
  // .use(useEcharts);
  app.mount("#app");
});
