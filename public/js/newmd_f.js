const uploadArticleBtn = document.querySelector("#uploadBtn");
uploadArticleBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("btn clicked");
  const url = "/articles/newmd";
  const title = document.querySelector("#floatingTextarea").value;
  const articleContent = document.querySelector("#floatingTextarea2").value;
  const category = document.querySelector("#category").value;
  const tag = document.querySelector("#tag").value;
  const description = document.querySelector("#description").value;
  const articleCover = document.querySelector("#articleCover").files[0];

  // let data = {};
  // data.title = title;
  // data.articleContent = articleContent;
  // data.category = category;
  // data.tag = tag;
  // data.description = description;

  console.log(articleCover);

  const formData = new FormData();
  formData.append("title", title);
  formData.append("articleContent", articleContent);
  formData.append("category", category);
  formData.append("tag", tag);
  formData.append("description", description);
  formData.append("coverPhoto", articleCover);
  formData.append("s3ImageRoute", "articleCover");
  console.log("firstTime value", $("#firstTime").text());
  if ($("#firstTime").text()) {
    formData.append("firstTime", 1);
  } else {
    formData.append("firstTime", 0);
  }
  // data = await JSON.stringify(data);
  // console.log(data);

  fetch("/images", {
    method: "POST",
    credentials: "include",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log(json.imagePath);

      formData.append("coverPhotoImagePath", json.imagePath);
      showArticle(url, formData);
    });
});

const showArticle = function (url, formData) {
  console.log(formData);
  fetch(url, {
    method: "POST",
    credentials: "include",

    body: formData,
  })
    .then(function (response) {
      // const resJson = await res.json();
      return response.text();
    })
    .then(function (data) {
      console.log(data);
      alert("文章上傳成功");
      self.location.href = `/articles/${data}`;
    })
    .catch((e) => {
      console.log("error");
      console.log(e);
    });
};
