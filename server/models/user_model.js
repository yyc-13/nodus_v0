const bcrypt = require("bcrypt");

const { pool } = require("./mysqlcon");

const USER_ROLE = {
  ALL: -1,
  ADMIN: 1,
  USER: 2,
};

const createUser = async (
  created_date,
  name,
  email,
  hashedPassword,
  accessToken
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [searchResult] = await conn.query(
      "select * from user_info where email = ? ",
      [email]
    );
    console.log(searchResult);
    if (searchResult.length > 0) {
      return "email have been registered.";
    }

    const [result] = await conn.query(
      "INSERT INTO user_info (created_date,name, email, password, access_token) VALUES (?,?,?,?,?)",
      [created_date, name, email, hashedPassword, accessToken]
    );
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

const authLogIn = async (email, hashedPassword) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT * FROM  user_info where email=? && password = ?",
      [email, hashedPassword]
    );
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

const storeToken = async (accessToken, userEmail) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "UPDATE user_info set access_token = (?) where email = (?)",
      [accessToken, userEmail]
    );
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

const userArticle = async (user) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `select user_id from user_info where email = "${user.data.email}"`
    );
    console.log(result);
    const user_id = result[0].user_id;
    const [articles] = await conn.query(
      `select * from articles where user_id = ${user_id}`
    );
    console.log(articles);
    await conn.query("COMMIT");
    return articles;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const getUserDetail = async (email, roleId) => {
  try {
    if (roleId) {
      const [users] = await pool.query(
        "SELECT * FROM user WHERE email = ? AND role_id = ?",
        [email, roleId]
      );
      return users[0];
    } else {
      const [users] = await pool.query("SELECT * FROM user WHERE email = ?", [
        email,
      ]);
      return users[0];
    }
  } catch (e) {
    return null;
  }
};

module.exports = {
  storeToken,
  authLogIn,
  createUser,
  userArticle,
  USER_ROLE,
  getUserDetail,
};
