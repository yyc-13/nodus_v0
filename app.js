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

// 照片上傳相關
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("./util/util");

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
app.post("/images", upload.single("coverPhoto"), async (req, res) => {
  const file = req.file;
  console.log(file);

  const result = await uploadFile(file);
  console.log(result);
  res.send({ imagePath: result.key });
});

const port = 3007;
app.listen(port, () => {
  console.log(`Nodus listening on port ${port}`);
});
// app.get("/test",(req,res)=>{
//   res.render("article")
// })

module.exports = app;
