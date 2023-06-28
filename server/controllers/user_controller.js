require("dotenv").config();

const userModel = require("../models/user_model");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const router = require("express").Router();
const bodyParser = require("body-parser");

const { ACCESS_TOKEN_SECRET } = process.env;

router.use(bodyParser.urlencoded({ extended: false }));

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60000000000",
  });
}

const userLogin = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const output = {};
  let dataData;

  const result = await userModel.authLogIn(email, hashedPassword);

  if (result.length < 1) {
    res.status(400).json("請輸入正確的 Email 和密碼");
  } else {
    const userData = {
      created_date: result[0].created_date,
      name: result[0].name,
      email: result[0].email,
      hashedPassword: hashedPassword,
      userId: result[0].user_id,
      // 之後再加上上傳照片
    };

    const userOutput = { data: userData };

    const accessToken = generateAccessToken(userOutput);
    await userModel.storeToken(accessToken, result[0].email);
    const user_info = await userModel.findUser(result[0].user_id);

    dataData = {
      accessToken: accessToken,
      access_expired: 600000,
      user: user_info,
    };
    res.cookie("accessToken", accessToken, {
      path: "/",
      signed: true,
      maxAge: 60000000000,
    });
    output.data = dataData;
    res.status(200).send(output.data);
  }
};

const userRegister = async (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const url_id = Number(
    Math.random().toString().substr(3) + Date.now()
  ).toString(36);

  const created_date = new Date().today() + " @ " + new Date().timeNow();
  const result = await userModel.createUser(
    created_date,
    name,
    email,
    hashedPassword,
    url_id,
    "https://nodus.s3.ap-southeast-1.amazonaws.com/default_profile.jpeg"
  );
  const userData = {
    created_date: created_date,
    name: name,
    email: email,
    hashedPassword: hashedPassword,
    userId: result.insertId,
  };
  const user = { data: userData };

  if (result == "email have been registered.") {
    res.status(400).send({ status: "email have been registered." });
  } else {
    const id = result.insertId;
    const accessToken = generateAccessToken(user);
    const dataData = {
      accessToken: accessToken,
      access_expired: 600000,
      user: {
        id: id,
        name: name,
        email: email,
        url_id: url_id,
      },
    };
    res.cookie("accessToken", accessToken, {
      path: "/",
      signed: true,
      maxAge: 60000000000,
    });
    res.status(200).send(dataData);
  }
};

const userArticle = async (req, res) => {
  const user = req.user;
  const result = await userModel.userArticle(user);

  res.status(200).json(result);
  return;
};

const profileOrSignIn = async (req, res) => {
  if (req.signedCookies.accessToken) {
    const accessToken = req.signedCookies.accessToken;

    try {
      const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

      const result = await userModel.findUser(user.data.userId);

      res.redirect(`/user/${result[0].url_id}`);
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  } else {
    res.render("loginSignup");
    return;
  }
};

const userChannel = async (req, res) => {
  const result = await userModel.userChannel(req.body.url_id);

  let data = {
    userResult: result.userResult,
    articleResult: result.articleResult,
  };
  res.status(200).json(data);
};

const subscribe = async (req, res) => {
  const result = await userModel.subscribe(
    "subscribe",
    req.body.articleSlug,
    req.user.data.userId
  );

  res.status(200).json(result);
};
const unsubscribe = async (req, res) => {
  const result = await userModel.subscribe(
    "unsubscribe",
    req.body.articleSlug,
    req.user.data.userId
  );

  res.status(200).json(result);
};

const newcollection = async (req, res) => {
  const result = await userModel.newcollection(
    req.user.data.userId,
    req.body.collectionName
  );

  res.status(200).json(result);
};

const changedescription = async (req, res) => {
  const result = await userModel.changedescription(
    req.user.data.userId,
    req.body.channelName,
    req.body.description
  );

  res.redirect("back");
};

const collectionList = async (req, res) => {
  if (req.user) {
    const result = await userModel.collectionList(req.user.data.userId);

    res.status(200).json(result);
  } else {
    const result = [];
    res.status(200).json(result);
  }
};

const channelAuth = async (req, res) => {
  const result = await userModel.channelAuth(req.body.userUrl);
  if (result[0].user_id == req.user.data.userId) {
    res.status(200).json(1);
  } else {
    res.status(200).json(0);
  }
};

const subscription = async (req, res) => {
  if (!req.user) {
    res.status(400).json(-1);
    return;
  }
  const result = await userModel.subscription(req.user.data.userId);

  res.status(200).json(result);
};

const getuser = async (req, res) => {
  if (!req.user) {
    res.status(200).json(-1);
    return;
  }
  const result = await userModel.getuser(req.user.data.userId);

  res.status(200).json(result);
};

module.exports = {
  userArticle,
  userLogin,
  userRegister,
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
};
