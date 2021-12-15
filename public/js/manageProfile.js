// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
function dynamicallyLoadScript(url) {
  var script = document.createElement("script"); // create a script DOM node
  script.src = url; // set its src to the provided URL

  document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");
// 更新頻道照片
$("#profilePicture").change(function () {
  const profilePicture = $(this).files[0];
});
// 做到一半 走 multer s3

const coverBtn = document.querySelector("#coverPhotoBtn");
coverBtn.addEventListener("change", async (e) => {
  try {
    const formData = new FormData();
    formData.append("coverPhoto", coverBtn.files[0]);
    formData.append("s3ImageRoute", "channelCover");
    formData.append("description", "handWriteDescription");
    // const result = await axios.post("/images", formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    fetch("/images", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        location.reload();
      });
  } catch (err) {}
});

const profilePicBtn = document.querySelector("#profilePictureBtn");
profilePicBtn.addEventListener("change", async (e) => {
  try {
    const formData = new FormData();
    formData.append("coverPhoto", profilePicBtn.files[0]);
    formData.append("s3ImageRoute", "profilePic");
    fetch("/images", {
      method: "POST",
      credentials: "include",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        location.reload();
      });
  } catch (err) {}
});

const fullUrl2 = window.location.href;
const channelUrlId = fullUrl2.substring(fullUrl2.lastIndexOf("/") + 1);
let channelApiBody = {};
channelApiBody.url_id = channelUrlId;

fetch("/user/userChannel", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(channelApiBody),
})
  .then((res) => res.json())
  .then((json) => {
    const channel = json.userResult[0];
    $("#userName").html(channel.name);
    $("#channelTitle").text(channel.channel_title);
    if (channel.sub_count == null) {
      channel.sub_count = 0;
    }
    $("#subCount").text(channel.sub_count);
    $("#channelDescription").text(channel.channel_description);
    if (channel.profile_pic) {
      $("#profilePicture").attr("src", channel.profile_pic);
    }
    if (channel.coverPhoto) {
      $("#coverPhoto").attr(
        "style",
        `background-image: url(${channel.coverPhoto})`
      );
    }
    if (channel.profile_pic) {
      $("#userProfilePicture").css(
        "background-image",
        `url(${channel.profile_pic})`
      );

      // $("#profilePicture").attr("src", channel.profile_pic)
    }
    json.articleResult.forEach((e) => {
      const articleBox = document.createElement("div");
      articleBox.setAttribute("class", " box col-6");
      e.content_html = e.content_html.replace(/(<([^>]+)>)/gi, "");
      articleBox.innerHTML = `  <div class="w3-margin row w3-border-bottom g-0 bg-light position-relative articleCard"
    style="height:300px;border-radius:10px">
    <div class="col-md-6 mb-md-0 p-md-4 col-3">

      <a href="/articles/${e.slug}">
        <div style="width:210px;height:210px;border-radius:10px;background-repeat:no-repeat;
                              background-position: center;
                              background-image:url(${e.cover_images});
                              background-size: cover;"></div>
      </a>
    </div>

    <div class="col-3 col-md-6 p-4 ps-md-0">
      <a href="/articles/${e.slug}">
        <h5 class="mt-0 card-title" style="margin:0px">${e.title}</h5>
      </a>
      
        <h6 class="text-secondary" style="margin:0px"> <br>${e.article_created_date}</h6>
      
      <a href="/articles/${e.slug}" class="text-black ">
        <p class="card-text">
          ${e.content_html}
        </p>
        <h6 class="views text-secondary">觀看次數：${e.views} • 按讚數：${e.likes} </h6>
      </a>
      <div class="mt-2">
        <button class="editBtn ownerOnly w3-btn w3-ripple w3-teal " id="${e.slug}"
          data-authorId="${e.user_id}">編輯</button>
        <button class="deleteBtn ownerOnly w3-btn w3-ripple w3-red" id="${e.slug}"
          data-authorId="${e.user_id}">刪除</button>
      </div>
    </div>
  </div>`;
      $("#articleContainer").append(articleBox);
    });
  })
  .then(() => {
    document.querySelectorAll(".deleteBtn").forEach((e) => {
      const slug = e.getAttribute("id");
      const authorId = e.getAttribute("data-authorid");

      e.addEventListener("click", (event) => {
        Swal.fire({
          title: "確定要刪除文章?",

          showCancelButton: true,
          confirmButtonText: "刪除",
          denyButtonText: `取消`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            const url = "/articles/delete";
            const article = { slug: slug, authorId: authorId };

            fetch(url, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(article),
            })
              .then((res) => res.json)
              .then((json) => {
                if (json == -1) {
                  Swal.fire("您沒有權限刪除這篇文章");
                } else {
                  Swal.fire("已刪除文章").then(() => {
                    location.reload();
                    return;
                  });
                }
              });
          }
        });
      });
    });
    // })
  })
  .then(() => {
    document.querySelectorAll(".editBtn").forEach((e) => {
      const slug = e.id;
      const authorId = e.getAttribute("data-authorId");
      e.addEventListener("click", (event) => {
        Swal.fire({
          title: "確定要編輯文章?",

          showCancelButton: true,
          confirmButtonText: "編輯",
          denyButtonText: `取消`,
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/articles/editor?slug=${slug}`, {
              method: "GET",
              credentials: "include",
            })
              .then((res) => {
                return res.json();
              })
              .then((json) => {
                if (json == "markdown") {
                  window.location.href = `/articles/editmd/${slug}`;
                } else {
                  window.location.href = `/articles/edittrix/${slug}`;
                }
              });
          }
        });
      });

      // e.addEventListener("click", ())
    });
  })
  .then(() => {
    let userApiBody = {};
    const fullUrl = window.location.href;
    const userUrl = fullUrl.substring(fullUrl.lastIndexOf("/") + 1);
    userApiBody.userUrl = userUrl;
    fetch("/user/channelAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userApiBody),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json !== 1) {
          const ownerOnlyArr = document.querySelectorAll(".ownerOnly");
          ownerOnlyArr.forEach((e) => {
            e.setAttribute("class", "d-none");
          });
        }
      });
  });
