require("dotenv").config();

const userModel = require("../models/user_model");
const bcrypt = require("bcrypt");

const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const router = require("express").Router();
const bodyParser = require("body-parser");
const { getArticles } = require("./article_controller");

const { ACCESS_TOKEN_SECRET } = process.env; // 30 days by seconds

// 從 app.use 改成 router.use，因為這邊 express 建立的是 router
router.use(bodyParser.urlencoded({ extended: false }));

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email + password);
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const output = {};
  let dataData;

  const result = await userModel.authLogIn(email, hashedPassword);
  if (result.length < 1) {
    res.send("Sorry, can't find user.");
  } else {
    const userData = {
      created_date: result[0].created_date,
      name: result[0].name,
      email: result[0].email,
      hashedPassword: hashedPassword,
      // 之後再加上上傳照片
    };

    const userOutput = { data: userData };
    const accessToken = generateAccessToken(userOutput);
    await userModel.storeToken(accessToken, result[0].email);

    dataData = {
      accessToken: accessToken,
      access_expired: 600000,
      user: userData,
    };
    res.cookie("accessToken", accessToken, {
      path: "/",
      signed: true,
      maxAge: 60000000000,
    });
    output.data = dataData;
    res.send(output.data);
  }
};

const userRegister = async (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const userData = {
    created_date: Date.now().toString(),
    name: name,
    email: email,
    hashedPassword: hashedPassword,
  };
  const user = { data: userData };
  const accessToken = generateAccessToken(user);

  const result = await userModel.createUser(
    Date.now().toString(),
    name,
    email,
    hashedPassword,
    accessToken
  );
  if (result == "email have been registered.") {
    res.send({ status: "email have been registered." });
  } else {
    const id = result.insertId;

    const dataData = {
      accessToken: accessToken,
      access_expired: 600000,
      user: {
        id: id,
        name: name,
        email: email,
      },
    };
    res.cookie("accessToken", accessToken, {
      path: "/",
      signed: true,
      maxAge: 60000000000,
    });
    res.send(dataData);
  }
};

const userArticle = async (req, res) => {
  console.log(req.user);
  const user = req.user;
  const result = await userModel.userArticle(user);
  console.log(result);

  res.json(result);
  return;
};

const userProfile = async (req, res) => {};

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err);
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

const profileOrSignIn = async (req, res) => {
  if (req.signedCookies.accessToken) {
    const accessToken = req.signedCookies.accessToken;
    console.log(accessToken);
    try {
      const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
      req.user = user;
      console.log(user);
      res.render("profile.ejs", { articles: [] });
    } catch (err) {
      console.error(err);
      res.redirect("/");
      // 之後改成用 ejs render 的路徑
    }
  } else {
    res.render("userSign");
    return;
  }
};

if (Array.length > 1) {
  getArticles.foreahc((article) => {});
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "60000000000",
  });
}

module.exports = {
  userArticle,
  userLogin,
  userRegister,
  userProfile,
  profileOrSignIn,
};
