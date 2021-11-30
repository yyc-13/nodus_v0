const router = require("express").Router();
const {
  userRegister,
  userLogin,
  userArticle,

  profileOrSignIn,
  userChannel,
  subscribe,
  unsubscribe,
  newcollection,
  changedescription,
  collectionList,
  channelAuth,
  subscription,
  getuser,
} = require("../controllers/user_controller");

const {
  authentication,
  authenticateOnly,
  wrapAsync,
} = require("../../util/util");

router.route("/profile").get(authentication(), wrapAsync(profileOrSignIn));

// direct render
router.route("/subscription").get(function (req, res) {
  res.render("user/subscription");
});
router.route("/collectiontab").get(function (req, res) {
  res.render("user/collectionTab");
});

router.route("/history").get(function (req, res) {
  res.render("history");
});

// APIs

router.route("/subscription").post(authentication(), wrapAsync(subscription));
// router.route("/article/api").get(authentication(), userArticle);
router.route("/login").post(wrapAsync(userLogin));
router.route("/register").post(wrapAsync(userRegister));
router.route("/deletecookie").get(function (req, res) {
  res.clearCookie("accessToken", {
    path: "/",
    signed: true,
    maxAge: 60000000000,
  });
  res.json({ status: "success" });
});

router.route("/authenticateonly").get(authenticateOnly());
router.route("/userChannel").post(authentication(), wrapAsync(userChannel));
router.route("/getuser").get(authentication(), wrapAsync(getuser));
router.route("/subscribe").post(authentication(), wrapAsync(subscribe));
router.route("/unsubscribe").post(authentication(), wrapAsync(unsubscribe));
router
  .route("/newCollectionList")
  .post(authentication(), wrapAsync(newcollection));
router
  .route("/changedescription")
  .post(authentication(), wrapAsync(changedescription));
router
  .route("/collectionList")
  .post(authentication(), wrapAsync(collectionList));
router.route("/channelAuth").post(authentication(), wrapAsync(channelAuth));

router.get("/:url_id", async (req, res) => {
  res.render("user/manageProfile");
});

module.exports = router;
