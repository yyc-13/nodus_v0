console.log(Date.now());
const dateNwo = Date.now().toLocaleString;
console.log(dateNwo);
console.log(new Date());
const dateNow = new Date().toLocaleString();
console.log(typeof dateNow);
console.log(dateNow);

let timestamp = 1513598707;
new Date(1513598707 * 1000); // 因為一般 timestamp 取得的是秒數，但要帶入的是毫秒，所以要乘 1000

// 或者
let date = new Date(timestamp * 1000);
dataValues = [
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
  date.getSeconds(),
];
console.log(dataValues);
console.log(new Date("2017-07-09 00:00:00 +0800").toLocaleString);
