// import { $t } from "@/plugins/i18n";
// const { VITE_HIDE_HOME, VITE_BASE_URL } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "HomeLayout",
  component: Layout,
  redirect: "/ppi",
  meta: {
    icon: "",
    title: "",
    rank: 0
  },
  children: [
    // {
    //   path: "/douyin",
    //   name: "Douyin",
    //   component: () => import("@/views/douyin/index.vue"),
    //   meta: {
    //     title: "抖音数据需求",
    //     showLink: VITE_HIDE_HOME === "true" ? false : true
    //   }
    // }
  ]
} satisfies RouteConfigsTable;
