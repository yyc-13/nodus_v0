const {
  getUnsplashApiKey,
  getHotTags,
  searchKeywords,
} = require("./search_controller");

const { showArticle } = require("./article_controller");

const mockRequest = () => ({
  session: {
    data: "",
  },
});
const mockRequest2 = (bodyData) => {
  return {
    body: { articleId: bodyData },
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

test("預期會拿到 unsplash 的 api key", async () => {
  const req = mockRequest();
  const res = mockResponse();
  await getUnsplashApiKey(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(
    "PZSam4mfZqYs39ABQ86KNm_M7pmtQL5OsRYAaAg1gC4"
  );
});

test("預期會拿到 Tag 陣列", async () => {
  const req = mockRequest();
  const res = mockResponse();
  await getHotTags(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([
    { recom_score: 1, tag: "疫苗混打", tags_id: 1 },
    { recom_score: 1, tag: "crypto", tags_id: 2 },
    { recom_score: 1, tag: "軟體工程師", tags_id: 3 },
    { recom_score: 1, tag: "職涯規劃", tags_id: 4 },
    { recom_score: 1, tag: "教學", tags_id: 5 },
    { recom_score: 1, tag: "台東", tags_id: 6 },
    { recom_score: 2, tag: "水煎包", tags_id: 7 },
    { recom_score: 1, tag: "秒殺美食", tags_id: 8 },
    { recom_score: 1, tag: "詐騙", tags_id: 9 },
    { recom_score: 2, tag: "區塊鏈", tags_id: 10 },
    { recom_score: 1, tag: "洗錢", tags_id: 11 },
    { recom_score: 1, tag: "加密貨幣", tags_id: 12 },
    { recom_score: 1, tag: "特務", tags_id: 13 },
    { recom_score: 2, tag: "書摘", tags_id: 14 },
    { recom_score: 1, tag: "nba", tags_id: 15 },
    { recom_score: 1, tag: "土耳其", tags_id: 16 },
    { recom_score: 1, tag: "坎特", tags_id: 17 },
    { recom_score: 1, tag: "中國", tags_id: 18 },
    { recom_score: 1, tag: "defi", tags_id: 19 },
    { recom_score: 1, tag: "blockchain", tags_id: 20 },
    { recom_score: 1, tag: "2r3", tags_id: 21 },
    { recom_score: 1, tag: "1223r", tags_id: 22 },
    { recom_score: 1, tag: "poj", tags_id: 23 },
    { recom_score: 1, tag: "pij", tags_id: 24 },
    { recom_score: 1, tag: "中美交易", tags_id: 25 },
    { recom_score: 1, tag: "選舉", tags_id: 26 },
    { recom_score: 4, tag: "總體經濟", tags_id: 27 },
  ]);
});

test("預期會拿到符合 articleId 的 article", async () => {
  const req = mockRequest2(
    "6ea99810c47c4b7e134918f956812356c7fb025628a0a0e06e0321e0debb4135"
  );
  const res = mockResponse();
  await showArticle(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  console.log(res.json);
  expect(res.json).toHaveBeenCalledWith({
    articleResult: [
      {
        article_created_date: "16/11/2021 @ 14:59:10",
        article_id: 9,
        category: "生活",
        content: "heyheyheyheyhehyeyhehyeyhehyehyhehyheyheyehyehyehyhey",
        content_html:
          "<p>heyheyheyheyhehyeyhehyeyhehyehyhehyheyheyehyehyehyhey</p>",
        cover_images:
          "https://nodus.s3.ap-southeast-1.amazonaws.com/articleCover/0c96336c512a2baaa9da21fe346d21e8",
        description: "阿彌陀佛",
        edited: null,
        editor: null,
        likes: 9,
        reading_time: "1",
        slug: "6ea99810c47c4b7e134918f956812356c7fb025628a0a0e06e0321e0debb4135",
        tag: "",
        title: "test",
        user_id: 9,
        views: 387,
      },
    ],
    authorResult: [
      {
        channel_description: null,
        channel_title: null,
        cover_photo: null,
        email: "",
        name: "",
        password:
          "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        profile_pic:
          "https://nodus.s3.ap-southeast-1.amazonaws.com/default_profile.jpeg",
        sub_count: 65,
        url_id: "xj79crvagr40000000",
        user_created_date: "1637044249237",
        user_id: 9,
      },
    ],
  });
});
