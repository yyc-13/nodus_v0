const router = require("express").Router();

const {
  searchKeywords,
  searchCategory,
  searchTag,
  getHotTags,
  tagArticle,
  catArticle,
  searchCat,
  keywords,
} = require("../controllers/search_controller");
const { authentication } = require("../../util/util");
// render 區域

router.route("/cat").get(searchCat);
router.route("/tag").get(searchTag);
router.route("/getHotTags").get(getHotTags); // api
router.route("/key").get(keywords);
router.get("/keywords/:params", authentication(), searchKeywords);
router.get("/tagArticle/:params", authentication(), tagArticle);
router.get("/catArticle/:params", authentication(), catArticle);

// router.route(/* category */).get(searchCategory);

// api

module.exports = router;
