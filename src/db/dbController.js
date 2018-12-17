const {
  dbConfig
} = require('../config');
const mysql = require('mysql');
var connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database
});
connection.connect();

// 查询或者插入返回promise对象
function query(sql, parmas) {
  return new Promise((resolve, reject) => {
    connection.query(sql, parmas, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  })
}

let dbController = {
  // 插入实时价格记录
  insertPrice: async (price) => {
    // 插入实时价格记录的sql
    var addSql = `
      INSERT INTO real_price (
        real_price_price,
        real_price_date,
        real_price_type
      )
      VALUES
        (?,?,?)
    `;
    var addSqlParams = [price.real_price_price, price.real_price_date, price.real_price_type];
    return await query(addSql, addSqlParams);
  },
  // 查询某类型的最近一条数据
  selectNewPrice: (price) => {
    // 查询某类型的最近一条的sql
    var selectSql = `
      SELECT
        *
      FROM
        real_price
      WHERE
        real_price_type = ?
      ORDER BY
        real_price_date DESC
      LIMIT 1
    `;
    var selectSqlParams = [price.real_price_type];
    return query(selectSql, selectSqlParams);
  },
};

module.exports = dbController;
