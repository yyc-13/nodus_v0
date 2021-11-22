const { param } = require("../routes/article_route");
const { pool } = require("./mysqlcon");

const searchKeywordsDB = async (paramsArr) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    let queryStr =
      "SELECT * from articles where concat(title, description, content) LIKE (";
    for (let i = 0; i < paramsArr.length; i++) {
      if (i == 0) {
        queryStr += `"%${paramsArr[i]}%")`;
      } else {
        queryStr += `or concat(title,description,content) LIKE("%${paramsArr[i]}%")`;
      }
    }
    console.log(queryStr);
    const [result] = await conn.query(queryStr);
    console.log(result);

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const searchCategory = async (queryParams) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `select * from articles where category = "${queryParams}"`
    );
    await conn.query("COMMIT");
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
    return -1;
  } finally {
    conn.release();
  }
};

const searchTag = async (queryParams) => {
  const conn = await pool.getConnection();
  try {
    console.log("asdasd", queryParams);
    const [result] = await conn.query(
      `select * from articles as a left join user_info as b on a.user_id = b.user_id where tag like "%${queryParams}%" `
    );
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    conn.release();
  }
};

const searchCat = async (queryParams) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `select * from articles as a left join user_info as b on a.user_id = b.user_id where category like "%${queryParams}%" `
    );
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    conn.release();
  }
};

const getHotTags = async () => {
  // 等推薦系統出來後用 recom 做排序
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query("select * from tags");
    console.log(result);
    await conn.query("commit");
    return result;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    conn.release();
  }
};

module.exports = {
  searchKeywordsDB,
  searchCategory,
  searchTag,
  searchCat,
  getHotTags,
};
