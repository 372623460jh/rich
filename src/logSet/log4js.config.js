// 当前日志需求：
// - 有 错误,info 2种日志级别
// - 请求外部的接口（如sina接口）报错时写入sina.xau.error.log中
// - 内部分析数据时出错时写入rich.xau.error.log中
// - 内部分析数据时正常时写入rich.xau.info.log中
//log4js 中文文档 http://www.wangweilin.net/static/pages/log4js-node.html

const log4js = require('log4js');
const path = require('path');

// 日志输出位置
const XAU_LOG = path.resolve(__dirname, '../../log/sina.xau.error');
const RICH_XAU_LOG = path.resolve(__dirname, '../../log/rich.xau');

// log级别为8级 ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF。(不区分大小写)
// 日志输出类型:file文件，console控制台，dateFile按时间变化的文件（一天创建一个日志文件）
log4js.configure({
  // pm2要设置为true
  pm2: true,
  // 输出到哪
  appenders: {
    // 普通的控制台输出类型
    console: {
      type: 'console', // 日志类型
    },
    // sina伦敦金的日志
    sinaXAU: {
      type: 'dateFile', // 日志类型
      filename: XAU_LOG, //日志名
      maxLogSize: 10000000, // 日志的最大大小
      encoding: 'utf-8', // 日志编码
      pattern: '.yyyy-MM-dd.log', // 日志名后缀的模板
      alwaysIncludePattern: true, // 和pattern同时使用 设置每天生成log名
    },
    // 内部处理伦敦金数据的日志
    richXAU: {
      type: 'dateFile', // 日志类型文字
      filename: RICH_XAU_LOG, //日志名
      maxLogSize: 10000000, // 日志的最大大小
      encoding: 'utf-8', // 日志编码
      pattern: '.yyyy-MM-dd.log', // 日志名后缀的模板
      alwaysIncludePattern: true, // 和pattern同时使用 设置每天生成log名
    },
  },
  /** 
   * 日志的分类
   * default：必填当所有的日志没有匹配到对应的分类时会使用该分类进行输出
   * appenders：匹配上后使用哪些appenders
   * level：输出等级过滤
   */
  categories: {
    // 默认分类,当所有的日志没有匹配到对应的分类时会使用该分类进行输出
    default: {
      appenders: [
        'console',
      ],
      level: 'all',
    },
    // 伦敦金错误日志
    sinaXAU: {
      appenders: [
        'sinaXAU',
      ],
      level: 'error'
    },
    // 项目处理日志
    richXAU: {
      appenders: [
        'richXAU',
      ],
      level: 'info'
    }
  }
});

const sinaXauLog = log4js.getLogger('sinaXAU');
const richXauLog = log4js.getLogger('richXAU');

module.exports = {
  sinaXauLog,
  richXauLog
}