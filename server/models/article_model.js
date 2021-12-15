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
    conn.release();
  }
};

const getArticles = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "select * from articles left join user_info on articles.user_id = user_info.user_id"
    );

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const insert = async (articlePack) => {
  const conn = await pool.getConnection();
  try {
    const articleArr = Object.values(articlePack);

    await conn.query("START TRANSACTION");
    const tags = articleArr[4].split(" ");
    const [result] = await conn.query(
      "INSERT INTO articles (user_id, title,content,category,tag,description,cover_images,article_created_date,edited,content_html,reading_time,slug,likes,views,editor) VALUES (?)",
      [articleArr]
    );

    tags.forEach(async (el) => {
      const [tagResult] = await conn.query(
        `select * from tags where tag = "${el}"`
      );

      if (tagResult.length > 0) {
        console.log("tag exist");
        tagResult[0].tags_id;
        await conn.query(
          `update tags set recom_score = recom_score +1 where tags_id =  ${tagResult[0].tags_id}`
        );
      } else {
        console.log("tag not exist");
        await conn.query(`insert into tags (tag,recom_score) values(?,?)`, [
          el,
          1,
        ]);
      }
    });

    await conn.query("COMMIT");
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};
const edit = async (articlePack) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      `UPDATE articles set title = (?), content = (?), category = (?), tag =(?), edited = (?),content_html = (?), reading_time = (?) where articles.slug = (?)`,
      [
        articlePack.title,
        articlePack.markdown,
        articlePack.category,
        articlePack.tag,
        articlePack.edited,
        articlePack.sanitizedHtml,
        articlePack.readingTime,
        articlePack.slug,
      ]
    );
    var imgResult;
    if (articlePack.coverPhotoPath) {
      console.log("articlePack.coverPhotoPath is true");
    } else {
      console.log("articlePack.coverPhotoPath is false");
    }

    if (articlePack.coverPhotoPath) {
      [imgResult] = await conn.query(
        `update articles set cover_images = COALESCE("${articlePack.coverPhotoPath}",cover_images) where articles.slug = "${articlePack.slug}"`
      );
    }
    await conn.query("commit");
    return { result, imgResult };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
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
    conn.release();
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
    if (collectQueryStr.length > 10) {
      console.log("collectQueryStr", collectQueryStr);
      let collectionQuery = `select * from collection_intermediate where article_id = ${article[0].article_id} and ${collectQueryStr}`;
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
    conn.release();
  }
};

const recommend = async (articleSlug) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("Start Transaction");
    const [result] = await conn.query(
      `SELECT * from articles where slug = "${articleSlug}"`
    );
    console.log(result);
    const category = result[0].category;
    const userID = result[0].user_id;
    const [recomSameCat] = await conn.query(
      `select * from articles as a left JOIN user_info as b on a.user_id = b.user_id where a.category = "${category}" and a.user_id != ${userID} order by a.article_id desc limit 3`
    );
    const [recomNewest] = await conn.query(
      `select * from articles as a left JOIN user_info as b on a.user_id = b.user_id where a.category != "${category}" and a.user_id !=${userID} order by a.article_id desc limit 3`
    );

    await conn.query("commit");
    return { recomSameCat, recomNewest };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
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
    conn.release();
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
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
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
    conn.release();
  }
};

const unchecked = async (collectionId, articleId, userId) => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `delete from collection_intermediate where collection_id = ${collectionId} and article_id = ${articleId}`
    );
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
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
    conn.release();
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
      `insert into likes (user_id,article_id,like_category) values (?,?,?)`,
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
        `update articles set likes = likes - 1 where article_id = ${articleId}`
      );
    }
    await conn.query("commit");
    return { likeResult, countResult };
  } catch (error) {
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const clickedBtn = async (articleId, category, userId) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      `delete from likes where user_id = ${userId} and article_id = ${articleId}`
    );
    if (category) {
      await conn.query(
        `update articles set likes = likes -1 where article_id = ${articleId}`
      );
    } else {
      await conn.query(
        `update articles set likes = likes + 1 where article_id = ${articleId}`
      );
    }
    return result;
  } catch (err) {
    console.log(err);
    return -1;
  } finally {
    conn.release();
  }
};

const editArticle = async (articleSlug) => {
  const conn = await pool.getConnection();
  const [result] = await conn.query(
    `select * from articles where slug = "${articleSlug}"`
  );
  conn.release();
  return result;
};

const deleteArticle = async (userId, articleSlug) => {
  const conn = await pool.getConnection();
  try {
    const [articleId] = await conn.query(
      `select article_id from articles where slug = (?)`,
      [articleSlug]
    );
    console.log("articleId", articleId);
    const result2 = await conn.query(
      `delete from history_intermediate where article_id = (?) `,
      [articleId[0].article_id]
    );
    const result = await conn.query(`delete from articles where slug = (?)`, [
      articleSlug,
    ]);

    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    console.log(error);
    return -1;
  } finally {
    conn.release();
  }
};

const history = async (userId) => {
  const conn = await pool.getConnection();
  const [result] = await conn.query(
    `select * from history_intermediate left join articles on history_intermediate.article_id = articles.article_id left join user_info on articles.user_id = user_info.user_id where history_intermediate.user_id = ${userId} and articles.user_id != ${userId} order by history_intermediate.history_id DESC`
  );
  conn.release();
  return result;
};

const getEditor = async (slug) => {
  const conn = await pool.getConnection();
  const [result] = await conn.query(
    `select editor from articles where slug = (?)`,
    [slug]
  );

  conn.release();
  return result;
};

module.exports = {
  searchArticles,
  insert,
  edit,
  getArticles,
  createArticle,
  searchUser,
  recommend,
  comment,
  saveHistory,
  savetocollection,
  unchecked,
  newComment,
  likeBtn,
  clickedBtn,
  deleteArticle,
  editArticle,
  history,
  getEditor,
};
