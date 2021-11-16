const router = require("express").Router();
const {
  saveArticleAndRedirect,
  getArticles,
  saveList,
  showArticle,
  articleshowArticle,
  user,
  recommend,
  comment,
  saveHistory,
  savetocollection,
  newComment,
  likeBtn,
} = require("../controllers/article_controller");

const Article = require("../models/article_model");

const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { authentication } = require("../../util/util");
const article_model = require("../models/article_model");

// render 區域
router.route("/newmd").get((req, res) => {
  res.render("articles/newmd_f", { article: "", firstTime: 1 });
});

router
  .route("/newmd") // 之後把 admin 改成登入後的會員
  .post(upload.single("coverPhoto"), authentication(), saveArticleAndRedirect);

router.route("/editorjs").get((req, res) => {
  res.render("editorJs_f");
});

// api 區域
router.route("/getArticle").get(authentication(), getArticles); //api
router.route("/article").post(showArticle);

router.get("/:slug", authentication(), saveHistory);

// 文章瀏覽頁面的 api
router.route("/articleshowArticle").post(authentication(), articleshowArticle);
router.route("/user").post(authentication(), user);
router.route("/recommend").post(authentication(), recommend);
router.route("/comment").post(authentication(), comment);
router.route("/savetocollection").post(authentication(), savetocollection);
router.route("/newComment").post(authentication(), newComment);
router.route("/likeBtn").post(authentication(), likeBtn);
// router.route("saveList").get(saveList);

module.exports = router;
