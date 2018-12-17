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
  // 数据库配置
  dbConfig: {
    database: 'rich', // 使用哪个数据库
    username: '', // 用户名
    password: '', // 口令
    host: '', // 主机名
    port: 3306 // 端口号，MySQL默认3306
  },
  // 伦敦金type
  XAU_TYPE: 'XAU',
}