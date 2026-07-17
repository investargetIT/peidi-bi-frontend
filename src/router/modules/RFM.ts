const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/rfm",
    name: "RFMLayout",
    redirect: "/rfm/index",
    component: Layout,
    meta: {
      icon: "vaadin/chart-3d",
      title: "RFM",
      showLink: true,
      rank: 11
    },
    children: [
      {
        path: "/rfm/index",
        name: "RFMIndex",
        component: () => import("@/views/RFM/index.vue"),
        meta: {
          title: "RFM",
          showLink: true
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
