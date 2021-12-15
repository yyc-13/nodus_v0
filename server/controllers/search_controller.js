require("dotenv").config();
const { UNSPLASH_ACCESS_KEY } = process.env;
const searchModel = require("../models/search_model");

const searchCat = async (req, res) => {
  res.render("searchCat");
};
const searchTag = async (req, res) => {
  res.render("searchTag");
};
const keywords = async (req, res) => {
  res.render("searchKey");
};

const searchKeywords = async (req, res) => {
  let search_params = req.params.params;
  if (search_params == undefined) {
    return;
  }
  let params = search_params.split(" ");
  const result = await searchModel.searchKeywords(params);
  result.sort(function (a, b) {
    return a - b;
  });
  res.status(200).json(result);
};

const tagArticle = async (req, res) => {
  let search_params = req.params.params;
  const result = await searchModel.searchTag(search_params);
  res.status(200).json(result);
};
const catArticle = async (req, res) => {
  let search_params = req.params.params;
  const result = await searchModel.searchCat(search_params);
  res.status(200).json(result);
};

const getHotTags = async (req, res) => {
  const result = await searchModel.getHotTags();
  res.status(200).json(result);
};

const getUnsplashApiKey = async (req, res) => {
  const apiKey = UNSPLASH_ACCESS_KEY;

  res.status(200).json(apiKey);
};

module.exports = {
  searchKeywords,
  searchCat,
  searchTag,
  getHotTags,
  tagArticle,
  catArticle,
  keywords,
  getUnsplashApiKey,
};
