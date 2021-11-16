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
  url_id
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
      "INSERT INTO user_info (user_created_date,name, email, password,url_id) VALUES (?,?,?,?,?)",
      [created_date, name, email, hashedPassword, url_id]
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

const userChannel = async (url_id) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [userResult] = await conn.query(
      `select * from user_info where url_id = "${url_id}"`
    );
    const userId = userResult[0].user_id;
    const [articleResult] = await conn.query(
      `select * from articles where user_id = "${userId}"`
    );

    await conn.query("COMMIT");
    return { userResult, articleResult };
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const subscribe = async (type, articleslug, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [articleResult] = await conn.query(
      `select * from articles where slug = "${articleslug}"`
    );
    const channel_user_id = articleResult[0].user_id;
    let subResult;
    if (type == "subscribe") {
      [subResult] = await conn.query(
        "insert into subscription (channel_user_id,user_id) values (?,?)",
        [channel_user_id, userId]
      );
    } else if (type == "unsubscribe") {
      [subResult] = await conn.query(
        `delete from subscription where channel_user_id = ${channel_user_id} and user_id = ${userId}`
      );
    }
    await conn.query("commit");
    return subResult;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const newcollection = async (userId, collectionName) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `insert into collection (collection_name,user_id) values(?,?)`,
      [collectionName, userId]
    );
    await conn.query("commit");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const channelCoverImg = async (userId, coverImgUrl) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `UPDATE user_info set coverPhoto = "${coverImgUrl}" where user_id = ${userId}`
    );
    await conn.query("commit");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const profilePic = async (userId, coverImgUrl) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `UPDATE user_info set profile_pic = "${coverImgUrl}" where user_id = ${userId}`
    );
    await conn.query("commit");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const changedescription = async (userId, channelName, description) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `UPDATE user_info set channelTitle = "${channelName}", channelDescription = (?) where user_id = ${userId}`,
      [description]
    );
    await conn.query("commit");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const findUser = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `select * from user_info where user_id = ${userId}`
    );
    await conn.query("commit");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const collectionList = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `select * from collection where user_id = ${userId}`
    );
    let collectionList = {};
    for (let i = 0; i < result.length; i++) {
      const [result2] = await conn.query(
        `select * from collection_intermediate as a left join articles as b on a.article_id = b.article_id where collection_id = ${result[i].collection_id}`
      );
      collectionList[result[i].collection_name] = result2;
    }
    console.log(collectionList);
    return collectionList;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};
const channelAuth = async (userUrl) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [result] = await conn.query(
      `select * from user_info where url_id = "${userUrl}"`
    );

    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};
module.exports = {
  storeToken,
  authLogIn,
  createUser,
  userArticle,
  USER_ROLE,
  getUserDetail,
  userChannel,
  subscribe,
  newcollection,
  channelCoverImg,
  profilePic,
  changedescription,
  findUser,
  collectionList,
  channelAuth,
};
