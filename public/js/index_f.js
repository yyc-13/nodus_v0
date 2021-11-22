import { createCard } from "./util/createCard.js";
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

fetch(`/articles/indexArticles`, {
  method: "GET",
  credentials: "include",
})
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.length < 1) {
      $("#noResult").removeClass("d-none");
      $("#noResult").text("抱歉，您的搜尋沒有結果...");
    }
    console.log("search result", json);
    createCard(json);
  });
