const router = require("express").Router();

const {
  searchKeywords,
  searchCategory,
  searchTag,
  getHotTags,
} = require("../controllers/search_controller");

// render 區域
router.route("/keywords").get(searchKeywords);
router.route("/category").get(searchCategory);
router.route("/tag").get(searchTag);

// router.route(/* category */).get(searchCategory);

// api
router.route("/getHotTags").get(getHotTags); // api

module.exports = router;
