const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/metabase",
    name: "MetabaseLayout",
    redirect: "/metabase/index",
    component: Layout,
    meta: {
      icon: "simple-icons/metabase",
      title: "Metabase",
      showLink: true,
      rank: 18
    },
    children: [
      {
        path: "/metabase/index",
        name: "MetabaseIndex",
        component: () => import("@/views/metabase/index.vue"),
        meta: {
          title: "Metabase",
          showLink: true
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
