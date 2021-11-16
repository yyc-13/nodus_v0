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

const mdInsert = async (articlePack) => {
  const conn = await pool.getConnection();
  try {
    const articleArr = Object.values(articlePack);

    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      "INSERT INTO articles (user_id, title,content,category,tag,description,cover_images,article_created_date,slug,content_html,reading_time,likes,views) VALUES (?)",
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
    const [articleResult] = await conn.query(
      "select * from articles where slug = ?",
      [slug]
    );
    const authorId = articleResult[0].user_id;
    const [authorResult] = await conn.query(
      "select * from user_info where user_id = ?",
      [authorId]
    );

    await conn.query("COMMIT");
    return { articleResult, authorResult };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const searchUser = async (articleSlug, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [article] = await conn.query(
      "SELECT article_id, user_id  from articles where slug = ?",
      [articleSlug]
    );
    console.log("article", article);
    const [user] = await conn.query(
      "select * from user_info where user_id = ?",
      [userId]
    );
    console.log("user", user);
    const [userCollection] = await conn.query(
      "SELECt * from collection where user_id = ?",
      [userId]
    );
    if (!userCollection) {
      userCollection = [];
    }
    console.log("userCollection", userCollection);
    let collectQueryStr = "";
    for (let i = 0; i < userCollection.length; i++) {
      if (i == 0) {
        collectQueryStr += `collection_id = ${userCollection[i].collection_id} `;
      } else {
        collectQueryStr += `or collection_id = ${userCollection[i].collection_id} `;
      }
    }
    let collectionContent;
    if (collectQueryStr.lenght > 10) {
      console.log("collectQueryStr", collectQueryStr);
      let collectionQuery = `select * from collection_intermediate where article_id = ${article[0].article_id} and (${collectQueryStr})`;
      [collectionContent] = await conn.query(collectionQuery);
      console.log("collectionContent", collectionContent);
    } else {
      collectionContent = [];
    }
    const [likeContent] = await conn.query(
      `select * from likes where user_id = ${userId} and article_id = ${article[0].article_id}`
    );
    console.log("likeContent", likeContent);
    const [subscription] = await conn.query(
      `select * from subscription where channel_user_id  = ${article[0].user_id} and user_id = ${userId}`
    );
    console.log("subscription", subscription);

    await conn.query("COMMIT");
    return {
      user,
      userCollection,
      collectionContent,
      likeContent,
      subscription,
    };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const recommend = async (articleSlug, userID) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("Start Transaction");
    const [result] = await conn.query(
      `SELECT * from articles where slug = "${articleSlug}"`
    );
    const category = result[0].category;
    const [recomSameCat] = await conn.query(
      `select * from articles as a left JOIN user_info as b on a.user_id = b.user_id where category = "${category}" order by article_id desc limit 3`
    );
    const [recomNewest] = await conn.query(
      `select * from articles as a left JOIN user_info as b on a.user_id = b.user_id where category != "${category}" order by article_id desc limit 3`
    );

    await conn.query("commit");
    return { recomSameCat, recomNewest };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};
const comment = async (articleSlug, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("Start transaction");
    const [result] = await conn.query(
      `select article_id from articles where slug = "${articleSlug}"`
    );
    const [comment] = await conn.query(
      `select * from comment as a left join user_info as b on a.user = b.user_id where article_id = "${result[0].article_id}"`
    );

    await conn.query("commit");
    return { comment };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const saveHistory = async (userId, articleSlug) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START transaction");
    const [article] = await conn.query(
      `select * from articles where slug = "${articleSlug}"`
    );
    const articleId = article[0].article_id;
    const [historyResult] = await conn.query(
      `select * from history_intermediate where user_id = ${userId} and article_id = ${articleId}`
    );
    let result;
    if (historyResult.length < 1) {
      [result] = await conn.query(
        `insert into history_intermediate (user_id, article_id) values(?,?)`,
        [userId, articleId]
      );
    }
    const viewsResult = await conn.query(
      "update articles set views = views + 1 where article_id = article_id"
    );
    await conn.query("commit");
    return { result, viewsResult };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const savetocollection = async (collectionId, articleId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("Start transaction");
    const [saveResult] = await conn.query(
      `insert into collection_intermediate (collection_id,article_id) values(?,?)`,
      [collectionId, articleId]
    );
    await conn.query("commit");
    return saveResult;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const newComment = async (
  articleId,
  commentInput,
  fatherComment,
  userId,
  dateTime
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [commentResult] = await conn.query(
      `insert into comment (user,content,likes,created_date,father_comment,article_id) values (?,?,?,?,?,?)`,
      [userId, commentInput, 0, dateTime, fatherComment, articleId]
    );
    await conn.query("commit");
    return commentResult;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    await conn.release();
  }
};

const likeBtn = async (articleId, category, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("start transaction");
    const [deleteResult] = await conn.query(
      `delete from likes where user_id = ${userId} and article_id = ${articleId}`
    );
    const [likeResult] = await conn.query(
      `insert into likes (user_id,article_id,likeCategory) values (?,?,?)`,
      [userId, articleId, category]
    );
    let countResult;
    if (category) {
      console.log("like + 1");
      [countResult] = await conn.query(
        `update articles set likes = likes + 1 where article_id = ${articleId}`
      );
    } else {
      console.log("dislike -1");
      [countResult] = await conn.query(
        `update articles set likes = likes + 1 where article_id = ${articleId}`
      );
    }
    await conn.query("commit");
    return { likeResult, countResult };
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
  searchUser,
  recommend,
  comment,
  saveHistory,
  savetocollection,
  newComment,
  likeBtn,
};
