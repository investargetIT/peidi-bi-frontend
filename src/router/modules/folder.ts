// import { $t } from "@/plugins/i18n";
// import { isDevEnv } from "@/utils/debug";
const Layout = () => import("@/layout/index.vue");

export default [
  // {
  //   path: "/folder",
  //   name: "FolderLayout",
  //   redirect: "/folder/index",
  //   component: Layout,
  //   meta: {
  //     icon: "ep/folder-add",
  //     title: "文档类型管理",
  //     // showLink: ,
  //     rank: 100
  //   },
  //   children: [
  //     {
  //       path: "/folder/index",
  //       name: "Folder",
  //       component: () => import("@/views/folder/index.vue"),
  //       meta: {
  //         title: "文档类型管理",
  //         icon: "ep/folder-add"
  //       }
  //     }
  //   ]
  // }
] satisfies Array<RouteConfigsTable>;
