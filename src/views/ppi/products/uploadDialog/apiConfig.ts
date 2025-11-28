class ApiConfig {
  static readonly PROMPT =
    "提取图片中的内容，获取标题title，星级star，评论数reviewCnt，价格amount，长期订购价longAmount，该字段的含义是on first Autoship的价格，如果没有可以不填写。最后输出一个json对象，若是多个则为json数组";

  static readonly PROMPT_ =
    "提取图片中的内容，获取标题title，星级star，评论数reviewCnt，价格amount，长期订购价longAmount，该字段的含义是on first Autoship的价格，如果没有可以不填写。最后输出一个json数组。格外再加一个属性id，id为一个唯一的字符串，用于标识该商品";
}

export default ApiConfig;
