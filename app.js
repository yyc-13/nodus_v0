require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const articleRouter = require("./server/routes/article_route");
const userRouter = require("./server/routes/user_route");
const searchRouter = require("./server/routes/search_route");

const { getArticles } = require("./server/controllers/article_controller");

const bodyParser = require("body-parser");
// create application/json parser
const cookieParser = require("cookie-parser");

const { authentication } = require("./util/util");
const user_model = require("./server/models/user_model");

// 照片上傳相關
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("./util/util");
// For todays date;
Date.prototype.today = function () {
  return (
    (this.getDate() < 10 ? "0" : "") +
    this.getDate() +
    "/" +
    (this.getMonth() + 1 < 10 ? "0" : "") +
    (this.getMonth() + 1) +
    "/" +
    this.getFullYear()
  );
};

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
// 在 router 中也會使用這些 middleware 因為 app.use 會由上到下依序執行
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// sign for cookie
app.use(cookieParser("123456789"));

app.use(express.json());

app.set("trust proxy", true);
// app.set('trust proxy', 'loopback');
app.set("json spaces", 2);

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

app.get("/", getArticles);

// 照片上傳 api
app.post(
  "/images",
  authentication(),
  upload.single("coverPhoto"),
  async (req, res) => {
    console.log("req.user", req.user);
    console.log("req.body", req.body);
    // 註明 s3 要放的資料夾

    const file = req.file;
    console.log("file", file);

    const result = await uploadFile(file, req.body.s3ImageRoute);
    fs.unlink(`uploads/${file.filename}`, function (err) {
      if (err) {
        console.error(err);
      }
      console.log("File Deleted");
    });
    console.log("result", result);
    let dbResult;
    if (req.body.s3ImageRoute == "channelCover") {
      dbResult = await user_model.channelCoverImg(
        req.user.data.userId,
        result.Location
      );
      console.log("dbResult", dbResult);
    } else if (req.body.s3ImageRoute == "articleCover") {
      console.log("in articleCover");
      res.send({ imagePath: result.Location });
    } else if (req.body.s3ImageRoute == "profilePic") {
      dbResult = await user_model.profilePic(
        req.user.data.userId,
        result.Location
      );
      console.log("in profilePic");
      res.send({ imagePath: result.Location });
    }
  }
);

const port = 3000;
app.listen(port, () => {
  console.log(`Nodus listening on port ${port}`);
  var datetime =
    "LastSync: " + new Date().today() + " @ " + new Date().timeNow();
  console.log(datetime);
});
// app.get("/test",(req,res)=>{
//   res.render("article")
// })

module.exports = app;
module.exports = upload;
