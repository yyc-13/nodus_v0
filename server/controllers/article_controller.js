const AES = require("crypto-js/aes");
const SHA256 = require("crypto-js/sha256");

const marked = require("marked");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
const Article = require("../models/article_model");
const util = require("../../util/util");
const path = require("path");

const saveArticleAndRedirect = async (req, res) => {
  console.log("req.user", req.user);
  console.log("red.body", req.body);
  const articlePack = {};
  articlePack.userId = req.user.data.userId;
  articlePack.title = req.body.title;

  articlePack.markdown = req.body.articleContent;
  articlePack.category = req.body.category;
  articlePack.tag = req.body.tag;
  articlePack.description = req.body.description;
  articlePack.coverPhotoPath = req.body.coverPhotoImagePath;
  articlePack.created_date = new Date().today() + " @ " + new Date().timeNow();
  articlePack.edited = req.body.edited;

  const currentTime = Date.now().toString();

  const articleId = SHA256(currentTime + articlePack.title).toString();

  if (articlePack.markdown) {
    articlePack.sanitizedHtml = dompurify.sanitize(
      marked(articlePack.markdown)
    );
  }
  const articlePureText = articlePack.sanitizedHtml.replace(
    /(<([^>]+)>)/gi,
    ""
  );
  const wordCount = articlePureText.split(" ").length;
  console.log("wordCount", wordCount);

  articlePack.readingTime = Math.ceil(wordCount / 250);
  console.log("articlePack.edited", articlePack.edited);
  console.log(!articlePack.edited);
  console.log(articlePack.edited);
  // 進 db
  if (articlePack.edited == false) {
    articlePack.slug = articleId;
    articlePack.likes = 0;
    articlePack.views = 0;
    console.log("articlePack", articlePack);
    const insertResult = await Article.mdInsert(articlePack);

    console.log("insertResult", insertResult);
  } else {
    articlePack.slug = req.body.slug;
    const editResult = await Article.mdEdit(articlePack);
    console.log("editResult", editResult);
  }
  res.send(articlePack.slug);
};

const getArticles = async (req, res) => {
  let result = await Article.getArticles();
  result = result.reverse();
  // strip html tag
  result.forEach(
    (e) => (e.content_html = e.content_html.replace(/(<([^>]+)>)/gi, ""))
  );

  if (result == -1) {
    res.status(500);
  } else {
    console.log(result);
    res.render("index_f", {
      articles: result,
    });
  }
};

const indexArticles = async (req, res) => {
  let result = await Article.getArticles();
  result = result.reverse();
  res.json(result);
};

const saveList = async (req, res) => {
  console.log(req.user);
  const user = req.user;
  const result = await userModel.user;
  res.json(result);
};

const showArticle = async (req, res) => {
  console.log(req.body);
  const result = await Article.searchArticles(req.body.articleId);
  console.log(result);
  res.json(result);
};

const articleshowArticle = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.user", req.user);
  const result = await Article.searchArticles(req.body.articleSlug);
  console.log("result", result);
  const article = result.articleResult[0];
  const author = result.authorResult[0];
  console.log("ers", article);
  if (!author.sub_count) {
    author.sub_count = 0;
  }

  article.tag = article.tag.split(" ");

  let data = {
    article: {
      title: article.title,
      coverImage: article.cover_images,
      id: article.article_id,
      category: article.category,
      readingTime: article.reading_time,
      tags: article.tag,
      articleHtml: article.content_html,
      views: article.views,
      publishDate: article.article_created_date,
      description: article.description,
      likeCount: article.likes,
      Id: article.article_id,
    },
    author: author,
  };
  res.json(data);
};

const user = async (req, res) => {
  console.log("req.body in user", req.body);
  console.log("req.user in user", req.user);
  if (!req.user) {
    res.json(-1);
    return -1;
  }
  const result = await Article.searchUser(
    req.body.articleSlug,
    req.user.data.userId
  );
  console.log("user result", result);
  if (result.userCollection.length < 1) {
    result.userCOllection = [];
  }
  let data = {
    user: {
      collections: [result.userCollection],
      userId: req.user.data.userId,
    },
    userCollected: result.collectionContent,
    userLike: result.likeContent,
    userSubscribed: result.subscription,
    userAvatar: result.user[0].profile_pic,
  };
  // 撈 user 的收藏清單
  // 撈 user 有沒有收藏
  // 撈 user 有沒有按讚
  // 撈 user 的頭像名字跟 id
  res.json(data);
};

const recommend = async (req, res) => {
  console.log("req.body in recommend", req.body);
  console.log("req.user in recommend", req.user);
  const result = await Article.recommend(req.body.articleSlug);
  console.log("recommend result", result);
  const recomArticle = result.recomSameCat.concat(result.recomNewest);
  let data = {
    recomArticle: recomArticle,
  };
  res.json(data);
};

const comment = async (req, res) => {
  console.log("req.body in recommend", req.body);
  console.log("req.user in recommend", req.user);

  const result = await Article.comment(req.body.articleSlug);
  result.comment.forEach((e) => {
    e.replyArr = [];
  });

  result.comment.forEach(function (e, index, array) {
    if (e.father_comment) {
      const father_comment = e.father_comment;
      for (let i = 0; i < result.comment.length; i++) {
        if (result.comment[i].comment_id == father_comment) {
          result.comment[i].replyArr.push(e);
          array.splice(index, 1);
        }
      }
    }
  });
  console.log("comment result", result);
  let data = {
    commentArr: result.comment,
  };
  res.json(data);
};

const saveHistory = async (req, res) => {
  console.log("req.user", req.user);
  console.log("controller slug", req.params.slug);
  if (req.user) {
    const result = await Article.saveHistory(
      req.user.data.userId,
      req.params.slug
    );

    console.log("saveHistory result", result);
  }

  res.render("articles/show_test");

  // 不加 next() 就可以正常運作
  // next();
};

const savetocollection = async (req, res) => {
  console.log("req.body in savetocollection", req.body);
  const collectionId = req.body.collectionId;
  const articleId = req.body.articleId;
  const userId = req.user.data.userId;
  console.log("req.user in savetocollection", req.user);
  const result = await Article.savetocollection(
    collectionId,
    articleId,
    userId
  );
  console.log("result in savetocollection", result);
  res.status(200).json("all good");
};

const unchecked = async (req, res) => {
  const collectionId = req.body.collectionId;
  const articleId = req.body.articleId;
  const userId = req.user.data.userId;
  const result = await Article.unchecked(collectionId, articleId, userId);
  res.status(200).json(result);
};

const newComment = async (req, res) => {
  console.log("req.body in newComment", req.body);
  console.log("req.user in newComment", req.user);
  var datetime = new Date().today() + " @ " + new Date().timeNow();
  console.log(datetime);
  const result = await Article.newComment(
    req.body.articleId,
    req.body.commentInput,
    req.body.fatherComment,
    req.user.data.userId,
    datetime
  );
  console.log("result in newComment", result);
  res.status(200).json(result);
};
const likeBtn = async (req, res) => {
  var datetime = new Date().today() + " @ " + new Date().timeNow();
  console.log(datetime);
  const result = await Article.likeBtn(
    req.body.articleId,
    req.body.category,
    req.user.data.userId
  );
  console.log("result in newComment", result);
  res.status(200).json(result);
};

const clickedBtn = async (req, res) => {
  const result = await Article.clickedBtn(
    req.body.articleId,
    req.body.category,
    req.user.data.userId
  );
  res.json(result);
};

const deleteArticle = async (req, res) => {
  console.log("req.user", req.user);
  console.log("req.body", req.body);
  if (req.user == null) {
    res.json(-1);
    return;
  }

  if (req.body.authorId != req.user.data.userId) {
    res.json(-1);
    return;
  }

  const result = await Article.deleteArticle(
    req.user.data.userId,
    req.body.slug
  );
  console.log(result);
  if (result == -1) {
    res.json(-1);
  } else {
    res.json("delete success");
  }
};

const editArticle = async (req, res) => {
  console.log("req.user", req.user);
  console.log("req.body", req.body);

  const result = await Article.editArticle(req.body.slug);
  if (req.user.data.userId != result[0].user_id) {
    res.json(-1);
    return;
  }
  console.log(result);
  res.json(result);
};

const history = async (req, res) => {
  console.log("req.user", req.user);
  console.log("req.body", req.body);
  if (req.user) {
    const result = await Article.history(req.user.data.userId);
    console.log(result);
    res.json(result);
  } else {
    const result = [];
    res.json(result);
  }
};

module.exports = {
  saveArticleAndRedirect,
  getArticles,
  showArticle,
  articleshowArticle,
  user,
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
  indexArticles,
};
