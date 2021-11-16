const searchModel = require("../models/search_model");

const searchKeywords = async (req, res) => {
  // get searchKeywords
  console.log("you are in search API!");
  let search_params = req.query.search_query;
  console.log(search_params);
  if (search_params == undefined) {
    return;
  }
  let paramsArr = search_params.split(" ");
  console.log(paramsArr);
  const result = await searchModel.searchKeywordsDB(paramsArr);
  // 之後有空加上搜尋排序

  result.sort(function (a, b) {
    return a - b;
  });

  res.render("searchPage_f", {
    articles: result,
    keywords: search_params,
    user: {},
  });
};

const searchCategory = async (req, res) => {
  console.log("you are in category API!");
  let search_params = req.query.q;
  console.log(search_params);
  const articles = await searchModel.searchCategory(search_params);

  res.render("searchPage_f", {
    articles: articles,
    keywords: search_params,
    user: {
      collection: [],
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
};

const searchTag = async (req, res) => {
  console.log("you are in tag API!");
  let search_params = req.query.q;
  console.log(search_params);
  const articles = await searchModel.searchTag(search_params);

  res.render("searchPage_f", {
    articles: articles,
    keywords: search_params,
    user: {
      collection: [],
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
};

const getHotTags = async (req, res) => {
  const result = await searchModel.getHotTags();

  res.json(result);
};

module.exports = { searchKeywords, searchCategory, searchTag, getHotTags };
