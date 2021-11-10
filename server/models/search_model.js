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
    await conn.release();
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
    await conn.release();
  }
};

const searchTag = async (queryParams) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `select tags_id from tags where tag = "${queryParams}"`
    );
    console.log(result);
    const [articles] = await conn.query(
      `select * from tag_interm left join articles on tag_interm.article_id = articles.article_id where tag_id= ${result[0].tags_id} `
    );

    await conn.query("Commit");
    return articles;
  } catch (err) {
    await conn.query("ROLLBACK");
    console.log(err);
  } finally {
    await conn.release();
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
    await conn.release();
  }
};

module.exports = {
  searchKeywordsDB,
  searchCategory,
  searchTag,
  getHotTags,
};
