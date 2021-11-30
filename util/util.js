require("dotenv").config();

const createApi = require("unsplash-js").createApi;

const User = require("../server/models/user_model");

const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SECRET, UNSPLASH_ACCESS_KEY } = process.env; // 30 days by seconds
// on your node server
const serverApi = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  //...other fetch options
});

const verifyJwt = (token) => {
  async () => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      res.send(user);
      next();
    });
  };
};

const authenticateOnly = (roleId) => {
  return async function (req, res) {
    if (req.signedCookies.accessToken) {
      const accessToken = req.signedCookies.accessToken;
      console.log(accessToken);
      try {
        const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        console.log(user);
        res.status(200).send({ status: "user signed in." });
      } catch {
        res.send({ error: "Forbidden" });
      }
    } else {
      res.send({ error: "Unauthorized" });
    }
  };
};

const authentication = (roleId) => {
  return async function (req, res, next) {
    // let accessToken = req.get("Authorization");
    if (req.signedCookies.accessToken) {
      const accessToken = req.signedCookies.accessToken;
      console.log(accessToken);
      try {
        const user = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);

        req.user = user;
        if (roleId == null) {
          next();
        } else {
          let userDetail;
          if (roleId == User.USER_ROLE.ALL) {
            userDetail = await User.getUserDetail(user.email);
          } else {
            userDetail = await User.getUserDetail(user.email, roleId);
          }
          if (!userDetail) {
            next();
          } else {
            req.user.id = userDetail.id;
            req.user.roleId = userDetail.role_id;
            next();
          }
        }
      } catch (err) {
        console.error(err);
        res.status(403).send({ error: "Fobidden" });
      }
    } else {
      next();
    }
  };
};

const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// 照片上傳到 s3
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});
const uploadFile = (file, s3route) => {
  const fileStream = fs.createReadStream(file.path);
  console.log(s3route);
  const uploadParams = {
    Bucket: bucketName + "/" + s3route,
    Body: fileStream,
    Key: file.filename,
    ContentType: "image/png",
  };
  return s3.upload(uploadParams).promise();
};

const setDate = () => {
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
};

module.exports = {
  authenticateOnly,
  verifyJwt,
  authentication,
  uploadFile,
  serverApi,
  setDate,
  wrapAsync,
};
