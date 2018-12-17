const moment = require('moment');
const schedule = require('node-schedule');
const {
  getXauData,
} = require('./service/fetchXauData');
const {
  TIME_FORMAT,
  TIME_FORMAT_DAY,
  TIME_FORMAT_MIN,
  XAU_TYPE,
} = require('./config');
const {
  richXauLog,
} = require('./logSet/log4js.config');
require('moment/locale/zh-cn');
// 使用北京时间
moment.locale('zh-cn');

// 本地缓存的数据库最后一条记录
let localData = null;
// 定时任务规则
let scheduleRule = {
  second: 15, // 没分钟的第5秒执行
}

/**
 * 返回数据的真实整分钟时间，如果时刻在0-6之间计算为明天时间
 * @param {*} date 2018-11-11 天
 * @param {*} time 00:22 时刻
 * @returns moment对象
 */
function getRealTime(date, time) {
  // 计算出时刻
  const hour = ~~(time.split(':')[0]);
  // 数据时间
  let fakeTime = moment(`${date} ${time}`, TIME_FORMAT_MIN);
  // 如果时刻在0-6之间说明是明天的数据
  let isTomorrow = (hour >= 0 && hour <= 6) ? true : false;
  // 改数据的真实时间
  let realTime = isTomorrow ? fakeTime.add(1, 'days') : fakeTime;
  // 返回真实时间的整分钟时间 2018-12-12 02:23:11 就返回 2018-12-12 02:23:00:0000 时刻的时间
  return realTime.startOf('minute');
}

/**
 * 处理sina数据为自己的格式
 * @param {*} sinaData 调sina获取到的数据
 * @returns 自己的格式 异常数据返回false
 */
function disposeData(sinaData) {
  // 数据时间
  const date = sinaData[0][0];
  // isError
  let isErrorData = false;
  // 处理后的数据
  const data = {
    sinaData: {},
    sinaArray: [],
  };
  // 上一个数据的时间
  let lastTime = null;
  for (let n = 0; n < sinaData.length; n++) {
    // 时刻
    let time = n === 0 ? sinaData[n][4] : sinaData[n][0];
    // 价格
    let price = n === 0 ? sinaData[n][5] : sinaData[n][1];
    // XAU加一层校验第一条数据必须是07:00否则报错
    if (n === 0 && time !== '07:00') {
      // 第一条数据就是异常数据
      richXauLog.warn(`异常数据[第一条数据不是07：00]:${sinaData[n].join(',')}`);
      isErrorData = true;
      break;
    }
    // 计算数据的真实时间
    let realTime = getRealTime(date, time);
    // 第一个数据或者realtime-lastTime等于1分钟
    if (!lastTime || realTime.diff(lastTime, 'minutes') === 1) {
      const obj = {
        time: realTime.valueOf(),
        realTime,
        price,
        index: n,
      };
      data.sinaData[obj.time] = obj;
      data.sinaArray[n] = obj;
      lastTime = realTime;
    } else {
      richXauLog.warn(`异常数据[数据时间不连续]:${sinaData[n].join(',')}`);
      break;
    }
  }
  return isErrorData ? false : data;
}

// /**
//  * 定时任务
//  */
// const timer = schedule.scheduleJob(scheduleRule, () => {
//   getXauData((data) => {
//     if (!localData) {
//       // 本地无记录
//       // 查询real_price表最近一条插入记录
//       localData = {
//         time: moment('2018-12-14 06:58', TIME_FORMAT_MIN).valueOf(),
//         realTime: moment('2018-12-14 06:58', TIME_FORMAT_MIN),
//         price: 9999.0000,
//       }
//     }
//     // 处理sina数据为自己数据
//     const myData = disposeData(data);
//     if (!myData) {
//       // 报错
//       return;
//     }
//     // 获取上一次数据在自己数据中的位置
//     const lastDataInNowData = myData.sinaData[localData.time];
//     // 插入数据的下标
//     let insetIndex = 0;
//     if (!lastDataInNowData) {
//       // 上一次数据不存在查询到的sina数据中。
//       // 有可能是之前有丢失数据;
//       // 或者是跨天 如上一条数据是2018-12-12 06:59 是11号的最后一条数据。现在查出的第一条数据是2018-12-12 07:00 这样的话2018-12-12 06:59时间在12号的数据中找不到,就从第一条插入
//       // 或者是节假日 如上一条数据是2018-12-15 06:59 是周六早晨的最后一条数据。12-15，12-16只能重复查到14号7.-15号6.59的数据 现在到了2018-12-17 07:00时lasttime在该数据中找不到也会从第一条数据插入
//       // 当前数据从第0个开始插入
//       insetIndex = 0;
//     } else {
//       insetIndex = lastDataInNowData.index + 1;
//     }
//     // 没有要插入的数据
//     if (!myData.sinaArray[insetIndex]) {
//       richXauLog.info('没有要插入的数据');
//       return;
//     }
//     // 遍历插入数据
//     for (; insetIndex < myData.sinaArray.length;) {
//       // 要插入的数据
//       const insertData = myData.sinaArray[insetIndex];
//       if (insertData) {
//         richXauLog.info(`插入数据----时间:${insertData.realTime.format(TIME_FORMAT)} ---价格:${insertData.price}`);
//         // 标记上一个数据为当前插入数据
//         localData = insertData;
//         // 插入下标+1
//         insetIndex += 1;
//       } else {
//         richXauLog.info('没有要插入的数据');
//         break;
//       }
//     }
//   });
// });

const dbController = require('./db/dbController');

async function autoTask() {
  if (!localData) {
    // 本地无记录
    // 查询real_price表最近一条插入记录
    const newData = await dbController.selectNewPrice({
      real_price_type: XAU_TYPE,
    })
    if (newData.length === 1) {
      // 查询最新数据成功
      localData = {
        time: moment(newData[0].real_price_date).valueOf(),
        realTime: moment(newData[0].real_price_date),
        price: newData[0].real_price_price,
      }
    } else {
      // 没有最新数据(放入一个很早的时间)
      localData = {
        time: moment('2018-12-14 06:58', TIME_FORMAT_MIN).valueOf(),
        realTime: moment('2018-12-14 06:58', TIME_FORMAT_MIN),
        price: 9999.0000,
      }
    }
  }
}
autoTask();
