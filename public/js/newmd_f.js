const uploadArticleBtn = document.querySelector("#uploadBtn");
uploadArticleBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const url = "/articles/newmd";
  const title = document.querySelector("#floatingTextarea").value;
  const articleContent = document.querySelector("#floatingTextarea2").value;
  const category = document.querySelector("#category").value;
  const tag = document.querySelector("#tag").value;

  if (
    (url == null || url == "",
    title == null || title == "",
    articleContent == null || articleContent == "",
    category == null || category == "",
    tag == null || tag == "")
  ) {
    console.log(url, title, articleContent, category, "tag", tag);
    Swal.fire("請填入完整內容");
    return false;
  }

  const articleCover = {};
  if (
    document.querySelector("#imgPreview").getAttribute("data-type") ==
    "unsplash"
  ) {
    articleCover.type = "unsplash";
    articleCover.url = document
      .querySelector("#imgPreview")
      .getAttribute("data-imgUrl");
  } else if (
    document.querySelector("#imgPreview").getAttribute("data-type") == "input"
  ) {
    articleCover.type = "input";
    articleCover.url = document.querySelector("#articleCover").files[0];
  }

  if (!urlArr.includes("edit")) {
    if (
      articleCover.url == null ||
      articleCover.url == undefined ||
      articleCover.url == ""
    ) {
      Swal.fire("請先上傳封面照片");
      return;
    }
  }

  const description = "";

  var formData = new FormData();
  formData.append("title", title);
  formData.append("articleContent", articleContent);
  formData.append("category", category);
  formData.append("tag", tag);
  formData.append("description", description);

  formData.append("coverPhoto", articleCover.url);
  formData.append("coverPhotoType", articleCover.type);
  formData.append("s3ImageRoute", "articleCover");
  console.log("firstTime value", $("#firstTime").text());
  if (urlArr.includes("edit")) {
    const slug = urlArr.at(-1);
    console.log("im edit");
    formData.append("edited", "1");
    formData.append("slug", slug);
  } else {
    console.log("im new");
    formData.append("edited", "0");
  }
  if ($("#firstTime").text()) {
    formData.append("firstTime", 1);
  } else {
    formData.append("firstTime", 0);
  }
  // data = await JSON.stringify(data);
  // console.log(data);
  console.log("formData before post image", formData);
  fetch("/images", {
    method: "POST",
    credentials: "include",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      if (
        document.querySelector("#imgPreview").getAttribute("data-type") ==
        "unsplash"
      ) {
        formData.append("coverPhotoImagePath", articleCover.url);
      } else if (
        document.querySelector("#imgPreview").getAttribute("data-type") ==
        "input"
      ) {
        formData.append("coverPhotoImagePath", json.imagePath);
      }

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
      console.log("edited?", formData.edited);
      if (formData.edited) {
        Swal.fire("文章編輯完成").then(() => {
          self.location.href = `/articles/${data}`;
        });
      } else {
        Swal.fire("文章上傳完成").then(() => {
          self.location.href = `/articles/${data}`;
        });
      }
    })
    .catch((e) => {
      console.log("error");
      console.log(e);
    });
};

const currentUrl = window.location.href;
const urlArr = currentUrl.split("/");
console.log(urlArr);
if (urlArr.includes("edit")) {
  const slug = urlArr.at(-1);
  const editBody = { slug: slug };
  console.log("editBody", editBody);
  fetch("/articles/edit", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editBody),
  })
    .then((res) => res.json())
    .then((json) => {
      console.log("jsonjson", json);
      if (json == -1) {
        Swal.fire({
          icon: "warning",
          title: "您沒有權限編輯這篇文章",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          self.location.href = "/";
        });
      }
      $("#uploadBtn").text("更新文章！");

      document.querySelector(".title").innerText = json[0].title;
      document.querySelector(".articleContent").innerHTML = json[0].content;
      document.querySelector("#category").value = json[0].category;
      const category = json[0].category;
      const catOptions = document.querySelector("#category");
      for (var i = 0; i < catOptions.options.length; i++) {
        if (catOptions.options[i] == category) {
          catOptions.selectedIndex = i;
          break;
        }
      }
      const tagArr = json[0].tag.split(" ");
      document.querySelector("#tag").dispatchEvent(new Event("change"));
      tagArr.forEach((el) => {
        const tagEl = document.createElement("span");
        tagEl.setAttribute("class", "tagin-tag");
        tagEl.innerHTML = `${el}<span class="tagin-tag-remove"></span>`;
        document.querySelector(".tagin-wrapper").appendChild(tagEl);
      });
      // var elem = document.querySelector(".tagin-input");
      // elem.parentNode.removeChild(elem);

      const tagInput = document.createElement("input");
      tagInput.setAttribute("class", "tagin-input");
      tagInput.setAttribute("type", "text");
      tagInput.setAttribute("placeholder", "");
      tagInput.setAttribute("style", "width:3px");
      document.querySelector(".tagin-wrapper").appendChild(tagInput);
    });
}

const articleCover = document.querySelector("#articleCover");

$("#articleCover").on("change", function () {
  const [file] = articleCover.files;

  if (file) {
    const imgUrl = URL.createObjectURL(file);

    $("#imgPreview").css("background-image", `url(${imgUrl})`);
    $("#imgPreview").attr("data-imgUrl", `${imgUrl}`);
    $("#imgPreview").attr("data-type", `input`);
  }
});
