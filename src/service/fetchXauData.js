const axios = require('axios');
const {
  JSONP_NAME,
  FETCH_URL
} = require('../config');
const {
  sinaXauLog
} = require('../logSet/log4js.config');

// 伦敦金实时数据
let nowData = [];

// jsonp请求回调的方法
global[JSONP_NAME] = function (data) {
  if (typeof data === "object" && data.result.status.code === 0) {
    // 请求数据成功
    nowData = data.result.data.minLine_1d;
  } else {
    // 日志记录错误信息
    sinaXauLog.error(data);
  }
}

// 获取实时黄金价格
module.exports.getXauData = function (isok) {
  axios.get(FETCH_URL)
    .then(response => {
      // 把字符串当做代码执行获取值
      new Function(response.data)();
      // 回调
      isok(nowData);
    })
    .catch(error => {
      // 日志记录错误信息
      sinaXauLog.error(error);
    });
};