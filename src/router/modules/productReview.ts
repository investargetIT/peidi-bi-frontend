const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/productReview",
    name: "ProductReviewLayout",
    redirect: "/productReview/index",
    component: Layout,
    meta: {
      icon: "carbon/review",
      title: "产品评价数据系统",
      showLink: true,
      rank: 16
    },
    children: [
      {
        path: "/productReview/index",
        name: "ProductReviewIndex",
        component: () => import("@/views/productReview/index.vue"),
        meta: {
          title: "产品评价数据系统",
          showLink: true
        }
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
