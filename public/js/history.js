import { createCard } from "./util/createCard.js";

const cookie = document.cookie;

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

    createCard(json);
  });
