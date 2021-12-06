const router = require("express").Router();
const {
  saveArticleAndRedirect,
  // getArticles,
  newTrixGet,
  newTrix,
  showArticle,
  articleshowArticle,
  user,
  recommend,
  comment,
  saveHistory,
  savetocollection,
  newComment,
  likeBtn,
  clickedBtn,
  deleteArticle,
  editArticle,
  history,
  indexArticles,
  unchecked,
} = require("../controllers/article_controller");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { authentication, wrapAsync } = require("../../util/util");

// render 區域
router.route("/newmd").get((req, res) => {
  res.render("articles/newmd_f", { firstTime: 1 });
});

router.route("/edit/:slug").get(function (req, res) {
  res.render("articles/newmd_f", { article: "", firstTime: "1" });
});

router
  .route("/newmd") // 之後把 admin 改成登入後的會員
  .post(upload.single("coverPhoto"), authentication(), saveArticleAndRedirect);

router.route("/editorjs").get((req, res) => {
  res.render("editorJs_f");
});

// api 區域
// router.route("/getArticle").get(authentication(), wrapAsync(getArticles));
router.route("/article").post(wrapAsync(showArticle));
router.route("/history").get(authentication(), wrapAsync(history));

// 文章瀏覽頁面的 api
router
  .route("/articleshowArticle")
  .post(authentication(), wrapAsync(articleshowArticle));

router.route("/user").post(authentication(), wrapAsync(user));
router.route("/recommend").post(authentication(), wrapAsync(recommend));
router.route("/comment").post(authentication(), wrapAsync(comment));
router
  .route("/savetocollection")
  .post(authentication(), wrapAsync(savetocollection));
router.route("/unchecked").post(authentication(), wrapAsync(unchecked));
router.route("/newComment").post(authentication(), wrapAsync(newComment));
router.route("/likeBtn").post(authentication(), wrapAsync(likeBtn));
router.route("/clickedBtn").post(authentication(), wrapAsync(clickedBtn));
// router.route("saveList").get(saveList);
router.route("/delete").post(authentication(), wrapAsync(deleteArticle));
router.route("/edit").post(authentication(), wrapAsync(editArticle));
router.route("/indexArticles").get(authentication(), wrapAsync(indexArticles));
router.route("/newtrix").get(authentication(), wrapAsync(newTrixGet));
router.route("/newtrix").post(authentication(), wrapAsync(newTrix));
router.get("/:slug", authentication(), wrapAsync(saveHistory));

module.exports = router;
