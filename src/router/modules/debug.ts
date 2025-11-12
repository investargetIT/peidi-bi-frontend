import { $t } from "@/plugins/i18n";
import { isDevEnv } from "@/utils/debug";
const Layout = () => import("@/layout/index.vue");

export default [
  // {
  //   path: "/debug",
  //   name: "DebugLayout",
  //   redirect: "/debug/index",
  //   component: Layout,
  //   meta: {
  //     icon: "ri/bug-line",
  //     title: $t("pd.menus.debug"),
  //     showLink: isDevEnv(),
  //     rank: 101
  //   },
  //   children: [
  //     {
  //       path: "/debug/index",
  //       name: "Debug",
  //       component: () => import("@/views/debug/index.vue"),
  //       meta: {
  //         title: $t("pd.menus.debug"),
  //         icon: "ri/bug-line"
  //       }
  //     }
  //   ]
  // }
] satisfies Array<RouteConfigsTable>;
