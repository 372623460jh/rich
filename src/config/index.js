/** 
 * 公共配置信息
 */

// 请求伦敦金的jsonp名字
const jsonpName = 'getdata'

module.exports = {
  // 请求伦敦金的jsonp名字
  JSONP_NAME: jsonpName,
  // 请求伦敦金的url
  FETCH_URL: `https://stock2.finance.sina.com.cn/futures/api/openapi.php/GlobalFuturesService.getGlobalFuturesMinLine?symbol=XAU&callback=${jsonpName}`,
  // 时间format
  TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  // 时间format年月日
  TIME_FORMAT_DAY: 'YYYY-MM-DD',
  // 时间format年月日时分
  TIME_FORMAT_MIN: 'YYYY-MM-DD HH:mm',
}