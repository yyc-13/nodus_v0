const router = require("express").Router();
const {
  saveArticleAndRedirect,
  getArticles,
  saveList,
} = require("../controllers/article_controller");

const { authentication } = require("../../util/util");
const article_model = require("../models/article_model");

// render 區域
router.route("/newmd").get((req, res) => {
  res.render("articles/newmd_f", { article: "" });
});
router
  .route("/newmd") // 之後把 admin 改成登入後的會員
  .post(authentication(), saveArticleAndRedirect);

router.route("/editorjs").get((req, res) => {
  res.render("editorJs_f");
});
router.route("/getArticle").get(authentication(), getArticles); //api

router.get("/:slug", async (req, res) => {
  try {
    let article = await article_model.searchArticles(req.params.slug);
    console.log(article);
    article = article[0];

    if (article == null) {
      res.redirect("/");
    } else {
      console.log(article.slug);
      res.render(`articles/show_test_f`, { article: article });
    }
  } catch {
    console.log(3);
    await res.render("articles/new", { article: article });
  }
});

// router.route("saveList").get(saveList);

module.exports = router;
