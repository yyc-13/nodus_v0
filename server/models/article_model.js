const { pool } = require("./mysqlcon");
const createArticle = async (/* 傳進來的 variable */) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "INSERT INTO articles (title) values (?)",
      ["test"]
    );
    await conn.query("COMMIT");
    return result.insertId;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const getArticles = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query("select * from articles");

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const mdInsert = async (article) => {
  const conn = await pool.getConnection();
  try {
    const articleArr = Object.values(article);
    console.log(articleArr);
    await conn.query("START TRANSACTION");
    const [searchResult] = await conn.query(
      "Select user_id from user_info where email = (?)",
      articleArr[4]
    );
    console.log(searchResult);
    articleArr.splice(4, 1, searchResult[0].user_id);
    const [result] = await conn.query(
      "INSERT INTO articles (title,description,content,created_date,user_id,slug,content_html ) VALUES (?)",
      [articleArr]
    );

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const searchArticles = async (slug) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query("select * from articles where slug = ?", [
      slug,
    ]);
    console.log(result);
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

module.exports = {
  searchArticles,
  mdInsert,
  getArticles,
  createArticle,
};
