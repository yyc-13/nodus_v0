const marked = require("marked");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
const Article = require("../models/article_model");
const util = require("../../util/util");

const saveArticleAndRedirect = async (req, res) => {
  console.log(req.user);

  console.log(req);
  const article = {};
  article.title = req.body.title;
  article.description = req.body.description;
  article.markdown = req.body.markdown;
  article.created_date = new Date().toLocaleDateString();
  // article.user_email = req.body.user.data.email;
  console.log(5);

  if (article.title) {
    article.slug = slugify(article.title, { lower: true, strict: true });
  }
  if (article.markdown) {
    article.sanitizedHtml = dompurify.sanitize(marked(article.markdown));
  }

  console.log(article);

  // 進 db
  const insertResult = await Article.mdInsert(article);
  console.log(insertResult);
  try {
    console.log(article.slug);
    console.log(1);
    res.send(article.slug);
  } catch (e) {
    console.log(2);
    console.log(e);
    res.render(`articles/newmd`, { article: article });
  }
};

const getArticles = async (req, res) => {
  let result = await Article.getArticles();
  result = result.reverse();
  // strip html tag
  result.forEach(
    (e) => (e.content_html = e.content_html.replace(/(<([^>]+)>)/gi, ""))
  );
  console.log(result);
  if (result == -1) {
    res.status(500);
  } else {
    res.render("index_f", {
      articles: result,
      user: {
        collection: ["寫扣相關", "我最愛的美食", "私藏經典", "療癒身心收藏"],
      },
      tags: [
        "中美南海駁火",
        "大 S 離婚",
        "Next.js",
        "大嘻哈時代",
        "氣候高峰會",
        "高端疫苗",
        "防疫",
        "英雄聯盟世界盃",
        "NBA 熱身賽",
        "bootstrap5",
        "大家都看無的 NFT",
        "必比登美食",
        "特斯拉",
        "Macbook Pro",
        "假日去哪玩",
      ],
    });
  }
};

const saveList = async (req, res) => {
  console.log(req.user);
  const user = req.user;
  const result = await userModel.user;
};

module.exports = {
  saveArticleAndRedirect,
  getArticles,
};
