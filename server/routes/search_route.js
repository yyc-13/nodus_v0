const router = require("express").Router();

const {
  searchKeywords,
  searchTag,
  getHotTags,
  tagArticle,
  catArticle,
  searchCat,
  keywords,
  getunsplashapikey,
  getUnsplashApiKey,
} = require("../controllers/search_controller");
const { authentication, wrapAsync } = require("../../util/util");
// render ejs
router.route("/cat").get(searchCat);
router.route("/tag").get(searchTag);
router.route("/key").get(keywords);

// APIs
router.route("/getHotTags").get(wrapAsync(getHotTags));

router.get("/keywords/:params", authentication(), wrapAsync(searchKeywords));
router.get("/tagArticle/:params", authentication(), wrapAsync(tagArticle));
router.get("/catArticle/:params", authentication(), wrapAsync(catArticle));
router.get(
  "/getunsplashapikey",

  wrapAsync(getUnsplashApiKey)
);

module.exports = router;
