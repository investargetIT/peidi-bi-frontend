const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/taobao",
    name: "TaobaoLayout",
    redirect: "/taobao/index",
    component: Layout,
    meta: {
      icon: "icon-park-outline/taobao",
      title: "淘宝评论分析系统",
      showLink: true,
      rank: 13
    },
    children: [
      {
        path: "/taobao/index",
        name: "TaobaoIndex",
        component: () => import("@/views/taobao/index.vue"),
        meta: {
          title: "淘宝评论分析系统",
          showLink: true
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
