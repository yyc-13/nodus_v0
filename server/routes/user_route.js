const router = require("express").Router();
const {
  userRegister,
  userLogin,
  userArticle,
  userProfile,
  profileOrSignIn,
} = require("../controllers/user_controller");
const path = require("path");
const { authentication } = require("../../util/util");

// const bodyParser = require("body-parser");
// // 從 app.use 改成 router.use，因為這邊 express 建立的是 router
// router.use(bodyParser.urlencoded({ extended: false }));

// render 區域
router.route("/profile").get(profileOrSignIn);

router.route("/sign*").get(function (req, res) {
  res.render("userSign");
});
router.route("/register").get(function (req, res) {
  res.render("register");
});
router.route("/article").get(function (req, res) {
  res.render("userArticle");
}); // render

// API 區域
router.route("/profileAuth").get(authentication(), function (req, res) {
  console.log(req.user);
  res.json(req.user);
  // res.render("profile", { articles: [] });
});

router.route("/article/api").get(authentication(), userArticle);
router.route("/login").post(userLogin);
router.route("/register").post(userRegister);
router.route("/deletecookie").get(function (req, res) {
  res.clearCookie("accessToken", {
    path: "/",
    signed: true,
    maxAge: 60000000000,
  });
  res.json({ status: "success" });
});

// router.route("/collection").get();
// router.route("/subscription").get();
// router.route("/profileAuth").get(authentication());

module.exports = router;
