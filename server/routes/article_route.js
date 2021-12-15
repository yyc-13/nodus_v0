const router = require("express").Router();
const {
  saveArticleAndRedirect,
  // getArticles,

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
  getEditor,
} = require("../controllers/article_controller");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { authentication, wrapAsync } = require("../../util/util");

// render 區域
router.route("/newmd").get((req, res) => {
  res.render("articles/newmd_f", { firstTime: 1 });
});
router.route("/newtrix").get((req, res) => {
  res.render("articles/newtrix", { firstTime: 1 });
});
router.route("/edittrix/:slug").get(function (req, res) {
  res.render("articles/newtrix", { article: "", firstTime: 0 });
});

router.route("/editmd/:slug").get(function (req, res) {
  res.render("articles/newmd_f", { article: "", firstTime: 0 });
});

router
  .route("/newmd") // 之後把 admin 改成登入後的會員
  .post(
    upload.single("coverPhoto"),
    authentication(),
    wrapAsync(saveArticleAndRedirect)
  );
router
  .route("/newtrix")
  .post(
    upload.single("coverPhoto"),
    authentication(),
    wrapAsync(saveArticleAndRedirect)
  );
router.route("/editorjs").get((req, res) => {
  res.render("editorJs_f");
});

// api 區域
// router.route("/getArticle").get(authentication(), wrapAsync(getArticles));
router.route("/article").post(wrapAsync(showArticle));
router.route("/editor").get(wrapAsync(getEditor));
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

router.get("/:slug", authentication(), wrapAsync(saveHistory));

module.exports = router;
