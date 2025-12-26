// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from "@pureadmin/utils";
import { addIcon } from "@iconify/vue/dist/offline";

// https://icon-sets.iconify.design/ep/?keyword=ep
import EpHomeFilled from "~icons/ep/home-filled?raw";

// https://icon-sets.iconify.design/ri/?keyword=ri
import RiSearchLine from "~icons/ri/search-line?raw";
import RiInformationLine from "~icons/ri/information-line?raw";
import RiBox3Line from "~icons/ri/box-3-line?raw";
import RiSettings3Line from "~icons/ri/settings-3-line?raw";
import RiFolder5Line from "~icons/ri/folder-5-line?raw";
import RiBugLine from "~icons/ri/bug-line?raw";
import RiUserSettingsLine from "~icons/ri/user-settings-line?raw";
import RiFolderLine from "~icons/ri/folder-line?raw";
import EpFolderAdd from "~icons/ep/folder-add?raw";
import VaadinChart3d from "~icons/vaadin/chart-3d?raw";
import RiTiktokLine from "~icons/ri/tiktok-line?raw";
import GisSearchGlobe from "~icons/gis/search-globe?raw";
import IconParkOutlineTaobao from "~icons/icon-park-outline/taobao?raw";

const icons = [
  // Element Plus Icon: https://github.com/element-plus/element-plus-icons
  ["ep/home-filled", EpHomeFilled],
  // Remix Icon: https://github.com/Remix-Design/RemixIcon
  ["ri/search-line", RiSearchLine],
  ["ri/information-line", RiInformationLine],
  ["ri/box-3-line", RiBox3Line],
  ["ri/settings-3-line", RiSettings3Line],
  ["ri/folder-5-line", RiFolder5Line],
  ["ri/bug-line", RiBugLine],
  ["ri/user-settings-line", RiUserSettingsLine],
  ["ri/folder-line", RiFolderLine],
  ["ep/folder-add", EpFolderAdd],
  ["vaadin/chart-3d", VaadinChart3d],
  ["ri/tiktok-line", RiTiktokLine],
  ["gis/search-globe", GisSearchGlobe],
  ["icon-park-outline/taobao", IconParkOutlineTaobao]
];

// 本地菜单图标，后端在路由的 icon 中返回对应的图标字符串并且前端在此处使用 addIcon 添加即可渲染菜单图标
icons.forEach(([name, icon]) => {
  addIcon(name as string, getSvgInfo(icon as string));
});
