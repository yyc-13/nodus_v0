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

  const currentTime = Date.now().toString();

  const articleId = SHA256(currentTime + articlePack.title).toString();
  articlePack.slug = articleId;
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

  // 進 db
  if (req.body.firstTime !== "0") {
    articlePack.likes = 0;
    articlePack.views = 0;
    console.log("articlePack", articlePack);
    const insertResult = await Article.mdInsert(articlePack);
    console.log("insertResult", insertResult);
  } else {
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
    res.render("index_f", {
      articles: result,
      user: {
        collection: ["寫扣相關", "我最愛的美食", "私藏經典", "療癒身心收藏"],
      },
      tags: [
        "中美南海駁火",
        "大 S 離婚",
        "Next.js",
        "大嘻哈時代",
        "氣候高峰會",
        "高端疫苗",
        "防疫",
        "英雄聯盟世界盃",
        "NBA 熱身賽",
        "bootstrap5",
        "大家都看無的 NFT",
        "必比登美食",
        "特斯拉",
        "Macbook Pro",
        "假日去哪玩",
      ],
    });
  }
};

const saveList = async (req, res) => {
  console.log(req.user);
  const user = req.user;
  const result = await userModel.user;
};

const showArticle = async (req, res) => {
  console.log(req.body);
  const result = await Article.searchArticles(req.body.articleId);
  console.log(result);
};

const articleshowArticle = async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.user", req.user);
  const result = await Article.searchArticles(
    req.body.articleSlug,
    req.user.data.userId
  );
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
  const result = await Article.recommend(
    req.body.articleSlug,
    req.user.data.userId
  );
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
  const result = await Article.comment(
    req.body.articleSlug,
    req.user.data.userId
  );
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
  const result = await Article.saveHistory(
    req.user.data.userId,
    req.params.slug
  );
  console.log("saveHistory result", result);
  var options = {
    root: path.join(__dirname, "../../public/views/articles"),
  };
  res.sendFile("show_test.html", options);
  // res.json("wtf");
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
  console.log("req.body in newComment", req.body);
  console.log("req.user in newComment", req.user);
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
  newComment,
  likeBtn,
};
