const { pool } = require("./mysqlcon");

const searchKeywords = async (params) => {
  const conn = await pool.getConnection();
  try {
    let query =
      "SELECT * from articles as a left join user_info as b on a.user_id = b.user_id where concat(title, description, content) LIKE ";
    let queryParams = [];
    for (param of params) {
      if (param == params[0]) {
        query += "(?)";
      } else {
        query += `or concat(title,description,content) LIKE (?)`;
      }
      queryParams.push(`%${param}%`);
    }
    const [result] = await conn.query(query, queryParams);
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const searchTag = async (params) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `select * from articles as a left join user_info as b on a.user_id = b.user_id where tag like (?) `,
      ["%" + params + "%"]
    );
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

const searchCat = async (params) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `select * from articles as a left join user_info as b on a.user_id = b.user_id where category like (?) `,
      [params]
    );
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

const getHotTags = async () => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query("select * from tags");
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    conn.release();
  }
};

module.exports = {
  searchKeywords,
  searchTag,
  searchCat,
  getHotTags,
};
