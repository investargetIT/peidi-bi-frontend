import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME, VITE_BASE_URL } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "RFMLayout",
  component: Layout,
  redirect: "/rfm",
  meta: {
    icon: "vaadin/chart-3d",
    title: "RFM",
    rank: 0
  },
  children: [
    {
      path: "/rfm",
      name: "RFM",
      component: () => import("@/views/RFM/index.vue"),
      meta: {
        title: "RFM",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    }
  ]
} satisfies RouteConfigsTable;
