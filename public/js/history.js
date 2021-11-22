import { createCard } from "./util/createCard.js";

const cookie = document.cookie;
console.log("cookie", cookie);

fetch("/articles/history", {
  method: "GET",
  credentials: "include",
})
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.length < 1) {
      Swal.fire("請先登入").then(() => {
        self.location.href = "/";
      });
    }
    console.log("history json", json);
    createCard(json);
  });
