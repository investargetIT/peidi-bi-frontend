// 权限设置相关的工具函数

// 管理员 id
const ADMIN_USER_IDS = [
  // 任琪琳
  "1870023775338692610",
  // 肖嘉玲
  "1869635118983348225"
];

// 开发人员 id
const DEV_USER_IDS = [
  // 沈皓钰
  "1926449443739600965",
  // 王家琦
  "1887377779519434753",
  // 张思宇
  "1850741012504838145",
  // Summer
  "1846392647319093250",
  ...ADMIN_USER_IDS
];

/**
 * 权限配置对象
 * 每个模块对应一个权限ID数组
 */
export const permissionSettings = {
  // 抖音数据需求 模块权限
  douyin: [
    ...DEV_USER_IDS,
    // 梁钰
    "1926449443739598911",
    // 段英姿
    "1926449443739598866"
  ],
  // 宠物档案 模块权限
  petProfiles: [
    ...DEV_USER_IDS,
    // 张梦雅
    "1872157829894832129",
    // 公艳菲
    "1899632313461420034",
    // 陶莹
    "1887398864008818690",
    // 席珍珍
    "1926449443739598856"
  ],
  // 产品控价 模块权限
  priceControl: [
    ...DEV_USER_IDS,
    // 潘明旺
    "1904055363841863682",
    // 蔡笑笑
    "1909905227809075202"
  ],
  // 产品评价数据系统 模块权限
  productReview: [
    ...DEV_USER_IDS,
    // 陶莹
    "1887398864008818690",
    // 乐丽霞
    "1926449443739598882",
    // 王继良
    "1926449443739600969",
    // 任琪琳
    "1870023775338692610",
    // 范振吉
    "1874711258007646210",
    // 陶启苗
    "1926449443739598874",
    // 周欣
    "1926449443739598880"
  ]
};

/**
 * 检查用户是否拥有指定模块的权限
 * @param userId 用户ID
 * @param module 模块名称
 * @returns 是否拥有权限
 */
export function hasPermission(userId: string, module: string): boolean {
  const modulePermissions =
    permissionSettings[module as keyof typeof permissionSettings];
  if (!modulePermissions) {
    return false;
  }
  return modulePermissions.includes(userId);
}
