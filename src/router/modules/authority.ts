import { $t } from "@/plugins/i18n";
import { isDevEnv } from "@/utils/debug";
const Layout = () => import("@/layout/index.vue");

export default [
  // {
  //   path: "/authority",
  //   name: "AuthorityLayout",
  //   redirect: "/authority/index",
  //   component: Layout,
  //   meta: {
  //     icon: "ri/user-settings-line",
  //     title: $t("pd.menus.userManage"),
  //     showLink: isDevEnv(),
  //     rank: 101
  //   },
  //   children: [
  //     {
  //       path: "/authority/index",
  //       name: "Authority",
  //       component: () => import("@/views/authority/index.vue"),
  //       meta: {
  //         title: $t("pd.menus.userManage"),
  //         icon: "ri/user-settings-line"
  //       }
  //     }
  //   ]
  // }
] satisfies Array<RouteConfigsTable>;
