require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const articleRouter = require("./server/routes/article_route");
const userRouter = require("./server/routes/user_route");
const searchRouter = require("./server/routes/search_route");

const { index } = require("./server/controllers/article_controller");

const bodyParser = require("body-parser");
// create application/json parser
const cookieParser = require("cookie-parser");

const { authentication, setDate } = require("./util/util");
const user_model = require("./server/models/user_model");

// 照片上傳相關
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("./util/util");

// For the time now
Date.prototype.timeNow = function () {
  return (
    (this.getHours() < 10 ? "0" : "") +
    this.getHours() +
    ":" +
    (this.getMinutes() < 10 ? "0" : "") +
    this.getMinutes() +
    ":" +
    (this.getSeconds() < 10 ? "0" : "") +
    this.getSeconds()
  );
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// sign for cookie
app.use(cookieParser("123456789"));

app.use(express.json());

app.set("trust proxy", true);
// app.set('trust proxy', 'loopback');
app.set("json spaces", 2);
setDate();
console.log(new Date().today() + " @ " + new Date().timeNow());
// View engine setup
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");

// CORS allow all
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/articles", articleRouter);
app.use("/user", userRouter);
app.use("/search", searchRouter);

app.get("/", index);

// 照片上傳 api
app.post(
  "/images",
  authentication(),
  upload.single("coverPhoto"),
  async (req, res) => {
    // 註明 s3 要放的資料夾

    if (req.body.coverPhotoType == "unsplash") {
      res.send({ imagePath: req.body.coverPhoto });
      return;
    }
    if (!req.file) {
      res.send({ imagePath: "" });
      return;
    }
    const file = req.file;

    const result = await uploadFile(file, req.body.s3ImageRoute);
    fs.unlink(`uploads/${file.filename}`, function (err) {
      if (err) {
        console.error(err);
      }
    });

    let dbResult;
    if (req.body.s3ImageRoute == "channelCover") {
      dbResult = await user_model.channelCoverImg(
        req.user.data.userId,
        result.Location
      );
    } else if (req.body.s3ImageRoute == "articleCover") {
      res.send({ imagePath: result.Location });
    } else if (req.body.s3ImageRoute == "profilePic") {
      dbResult = await user_model.profilePic(
        req.user.data.userId,
        result.Location
      );

      res.send({ imagePath: result.Location });
    } else if (req.body.s3ImageRoute == "articlePhoto") {
      res.send({ imagePath: result.Location });
    }
  }
);
// 404 page
app.use(function (req, res, next) {
  res.status(404);
  // respond with html page
  if (req.accepts("html")) {
    res.render("404", { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }

  // default to plain-text. send()
  res.type("txt").send("Not found");
});

app.use(function (err, req, res, next) {
  res.status(500).send("Internal Server Error");
});
const port = 3000;
app.listen(port, () => {
  var datetime =
    "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
});

// app.get("/test",(req,res)=>{
//   res.render("article")
// })

module.exports = app;
module.exports = upload;
