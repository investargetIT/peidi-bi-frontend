const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/ppi",
    name: "PPILayout",
    redirect: "/ppi/index",
    component: Layout,
    meta: {
      icon: "gis/search-globe",
      title: "Petfood insight",
      showLink: true,
      rank: 10
    },
    children: [
      {
        path: "/ppi/index",
        name: "PPIIndex",
        component: () => import("@/views/ppi/index.vue"),
        meta: {
          title: "Petfood insight",
          showLink: true
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
