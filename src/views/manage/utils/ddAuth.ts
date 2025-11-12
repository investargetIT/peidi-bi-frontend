import * as dd from "dingtalk-jsapi";
import { getJsApi } from "@/api/user";
import { SYSTEM_CONFIG } from "@/constants/system";

const DINGTALK_CORP_ID = SYSTEM_CONFIG.DINGTALK_CORP_ID;
const NOCESTR = SYSTEM_CONFIG.NOCESTR;
// const AGENT_ID = SYSTEM_CONFIG.AGENT_ID;
// const APP_ID = SYSTEM_CONFIG.APP_ID;

export const ddAuthFun = () => {
  getJsApi({
    nonceStr: NOCESTR,
    url: location.href
  }).then((res: any) => {
    // dd.config去注册接口
    const {
      data: { sign, timeStamp }
    } = res;
    if (sign && timeStamp) {
      dd.config({
        // appId: AGENT_ID, // 必填，微应用ID  agentId不行就用appId，猜测和版本相关
        // appId: APP_ID, // 必填，微应用ID

        // agentId: AGENT_ID, // 必填，微应用ID
        agentId: "3317230753", // 必填，微应用ID PM项目的

        corpId: DINGTALK_CORP_ID, //必填，企业ID
        timeStamp, // 必填，生成签名的时间戳
        nonceStr: NOCESTR, // 必填，自定义固定字符串。
        signature: sign, // 必填，签名
        type: 0, //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
        jsApiList: ["biz.contact.choose"] // 必填，需要使用的jsapi列表，注意：不要带dd。
      });

      dd.error(function (err) {
        console.log("dd error: " + location.href + JSON.stringify(err));
        // alert("dd error: " + location.href + JSON.stringify(err));
      });
    }
  });
};
