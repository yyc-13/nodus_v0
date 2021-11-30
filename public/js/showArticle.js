let articleApiBody = {};
const fullUrl = window.location.href;
const articleSlug = fullUrl.substring(fullUrl.lastIndexOf("/") + 1);
articleApiBody.articleSlug = articleSlug;
articleApiBody = JSON.stringify(articleApiBody);

// 抓文章相關的 api
fetch("/articles/articleshowArticle", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: articleApiBody,
})
  .then((res) => res.json())
  // .catch(error => console.error("error:", error))
  .then((json) => {
    $(".coverPhoto").css(
      "background-image",
      `url("${json.article.coverImage}")`
    );
    $("#articleTitle").html(json.article.title);
    $("#category").html(json.article.category);
    $("#categoryLink").attr("href", `/search/cat?q=${json.article.category}`);
    $("#readingTime").html(json.article.readingTime);
    const tagsSection = document.querySelector("#tagsSection");
    for (let i = 0; i < json.article.tags.length; i++) {
      const tag = document.createElement("div");
      tag.setAttribute("class", "w3-tag w3-round w3-blue mx-1");
      tag.setAttribute("style", "padding:5px");
      tag.innerHTML = `<strong>${json.article.tags[i]}</strong>`;
      const a = document.createElement("a");
      a.setAttribute("href", `/search/tag?q=${json.article.tags[i]}`);

      tagsSection.appendChild(a);
      a.appendChild(tag);
    }
    $("#articleHtml").html(json.article.articleHtml);
    const views = document.createElement("h5");
    views.classList.add("text-secondary");
    views.style.textAlign = "end";
    views.innerText = "觀看次數 " + json.article.views;
    views.classList.add("mx-5");
    $("#articleHtml").append(views);

    document.querySelector(
      "#authorAvatar"
    ).style.backgroundImage = `url(${json.author.profile_pic})`;
    $("#authorAvatarLink").attr("href", "/user/" + json.author.url_id);
    $("#subCount").text(json.author.sub_count + " 位訂閱者");
    $("#authorName").text(json.author.name);
    $("#publishDate").text(json.article.publishDate);
    $("#articleDescription").html(json.author.channel_description);
    $(".authorLink").attr("href", "/user/" + json.author.url_id);
    $("#likeCount").text(json.article.likeCount);
    $("#defaultLikeCount").text(json.article.likeCount);
    $("#articleId").text(json.article.Id);
  });
// 抓用戶和這篇文章關係的 api

let articleUserBody = {};

articleUserBody.articleSlug = articleSlug;
articleUserBody = JSON.stringify(articleUserBody);
fetch("/articles/user", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: articleUserBody,
})
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json == -1) {
      throw "user not log in.";
    }

    // user 相關的 api
    const collectionContainer = document.querySelector("#collectionContainer");

    json.user.collections[0].forEach((e) => {
      const collectionName = document.createElement("div");
      collectionName.setAttribute("class", "row");
      collectionName.innerHTML = `                      
                        <input type="checkbox" class="col-1 collectionList" id="collectionId${e.collection_id}" name="vehicle3" value="${e.collection_id}"
                          style="margin-right: 5px; width: 20px;height: 20px;">
                        <label for="vehicle3" class="col">
                          <h4 style="margin-top: 0px;"> ${e.collection_name} </h4>
                        </label><br>
                      `;
      $("#collectionContainer").append(collectionName);
    });

    if (json.userCollected.length > 0 /* 直接去撈用戶有沒有收藏 */) {
      // 去抓 user 有收藏的清單，如果有加上 checked attr
      json.userCollected.forEach((e) => {
        const articleId = $("#articleId").text();
        if (e.article_id == articleId) {
          $("#hadCollected").removeClass("d-none");
          $("#unCollected").addClass("d-none");
          $(`#collectionId${e.collection_id}`).attr("checked", "");
        }
      });
    }
    if (json.userLike[0]) {
      if (json.userLike[0].like_category == 1) {
        $(".likeSvg").addClass("d-none");
        $(".likedSvg").removeClass("d-none");
        $(".dislikeSvg").removeClass("d-none");
        $(".dislikedSvg").addClass("d-none");
      } else if (json.userLike[0].length < 1) {
        $(".likeSvg").removeClass("d-none");
        $(".likedSvg").addClass("d-none");
        $(".dislikeSvg").removeClass("d-none");
        $(".dislikedSvg").addClass("d-none");
      } else if (json.userLike[0].like_category == 0) {
        $(".likeSvg").removeClass("d-none");
        $(".likedSvg").addClass("d-none");
        $(".dislikeSvg").addClass("d-none");
        $(".dislikedSvg").removeClass("d-none");
      }
    }
    if (json.userSubscribed.length > 0) {
      $("#non-subscribe").addClass("d-none");
      $("#subscribed").removeClass("d-none");
    }

    document.querySelector(
      "#userAvatar"
    ).style.backgroundImage = `url("${json.userAvatar}")`;
    $("#userAvatar").attr("data-userId", json.user.userId);
  })
  .then(() => {
    const collectListArr = document.querySelectorAll(".collectionList");

    collectListArr.forEach((e) => {
      if (e.getAttribute("id") == "newCollectionInput") {
        return;
      }
      e.addEventListener("click", function (event) {
        if (e.checked) {
          let data = {
            collectionId: e.value,
            articleId: $("#articleId").text(),
          };

          fetch("/articles/savetocollection", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              $("#hadCollected").removeClass("d-none");
              $("#unCollected").addClass("d-none");
              Swal.fire("已加入收藏清單");
            });
        } else {
          // checked

          let data = {
            collectionId: e.value,
            articleId: $("#articleId").text(),
          };

          fetch("/articles/unchecked", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((res) => res.json)
            .then((json) => {
              Swal.fire("已從收藏清單移除");
              const collections = document.querySelectorAll(".collectionList");
              let toggle = 0;

              for (let i = 0; i < collections.length - 1; i++) {
                if (collections[i].checked) {
                  return;
                }
              }

              $("#hadCollected").addClass("d-none");
              $("#unCollected").removeClass("d-none");
            });
        }
      });
    });
  })
  .catch((err) => {});

let recommendApiData = {};
recommendApiData.articleSlug = articleSlug;
// 推薦文章 api
fetch("/articles/recommend", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(recommendApiData),
})
  .then((res) => res.json())
  .then((json) => {
    json.recomArticle.forEach((e) => {
      e.pureText = e.content_html.replace(/(<([^>]+)>)/gi, "");
      const recomArticle = document.createElement("div");
      recomArticle.setAttribute("id", e.article_id);
      recomArticle.setAttribute("class", "row box");
      // 等 manageProfile 頁完成要增加用戶頻道的連結

      recomArticle.innerHTML = `<div class="box ">
  <div class="w3-margin row w3-border-bottom g-0 bg-light position-relative articleCard" style="height:300px;border-radius:10px">
          <div class="d-flex align-items-center col-md-6 mb-md-0 p-md-4 col-3">
            <a href="/articles/${e.slug}">
              <div style="width:160px;height:160px;border-radius:10px;background-repeat:no-repeat;
                    background-position: center;
                    background-image:url(${e.cover_images});
                    background-size: cover;"></div>
            </a>
          </div>
          <div class="col-3 col-md-6 p-4 ps-md-0">
            <a href="/articles/${e.slug}">
              <h5 class="mt-0 card-title">${e.title}</h5>
            </a>
            <a href="/user/${e.url_id}" id="recomAuthorChannelLink">
              <h6 class="text-secondary">${e.name} <br>${e.article_created_date}</h6>
            </a>
            <a href="/articles/${e.slug}" class="text-black ">
              <p class="card-text">
                ${e.pureText}
              </p>
              <h6 class="views text-secondary">觀看次數：${e.views} • 按讚數：${e.likes} </h6>
            </a>

          </div>
        </div>
</div>`;

      $("#recomArticleContainer").append(recomArticle);
    });
  });

let articleCommentApi = {};
articleCommentApi.articleSlug = articleSlug;
// 留言區 api
fetch("/articles/comment", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(articleCommentApi),
})
  .then((res) => res.json())
  .then((json) => {
    json.commentArr.forEach((e) => {
      const comment = document.createElement("div");
      comment.setAttribute("class", "d-flex flex-row mb-4");
      comment.setAttribute("id", "comment" + e.comment_id);
      comment.innerHTML = `            <div class="col-1 me-2">
              <a href="/user/${e.url_id}">
                <div class=" user-avatar" style="width:60px;height:60px;background-repeat:no-repeat;
              background-position: center;
              background-image:url(${e.profile_pic});
              background-size: cover;"></div>
                
            </div>`;
      $("#commentsContainer").append(comment);
      const commentTextCol = document.createElement("div");
      commentTextCol.setAttribute("class", "d-flex flex-column");
      commentTextCol.setAttribute("id", "commentTextCol" + e.comment_id);

      commentTextCol.innerHTML = `            
              <div class="d-flex flex-row">
                <a href="/user/${e.url_id}" class="d-flex flex-row"><div class="name mx-2"><b>${e.name}</b></div>
                <div class="text-muted mb-2">
                  ${e.created_date}
                </div>
                </a>
              </div>
              <div class="comment mx-2 mb-2">
                ${e.content}
              </div>`;

      document
        .querySelector(`#comment${e.comment_id}`)
        .appendChild(commentTextCol);
      if (e.replyArr.length > 0) {
        e.replyArr.forEach((eReply) => {
          const replyComment = document.createElement("div");
          replyComment.setAttribute("class", "collapse");
          replyComment.setAttribute("id", "collapseExample"); //之後改成獨一無二 id 並綁定按鈕
          replyComment.innerHTML = `                <div class="card card-body d-flex flex-row mb-4">
                  <div class="col-1 me-2">
                                    <a href="${eReply.user_channel_link}">
                                      <div class=" user-avatar" style="width:60px;height:60px;background-repeat:no-repeat;
                background-position: center;
                background-image:url(${eReply.AvatarLink});
                background-size: cover;"></div>
                                      </a>
                  </div>
                  <div class="d-flex flex-column">
                    <div class="d-flex flex-row">
                      <a href="${eReply.user_channel_link}" class="d-flex flex-row"><div class="name mx-2"><b>${eReply.name}</b></div>
                      <div class="text-muted mb-2">
                        ${eReply.created_date}
                      </div>
                    </div>
                    <div class="comment mx-2 mb-2">
                      ${eReply.content}
                    </div>
                    <div class="icons comment-reply my-1 d-flex flex-row">
                      <!-- 正讚 -->

                      <svg class="mx-3 likeBtn" width="18" height="18" viewBox="-31 0 512 512"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="m0 497c0 8.285156 6.714844 15 15 15h90c14.421875 0 27.273438-6.828125 35.515625-17.414062 36.5625 11.550781 74.515625 17.414062 112.90625 17.414062h121.578125c24.8125 0 45-20.1875 45-45 0-5.855469-1.136719-11.449219-3.179688-16.585938 19.09375-5.203124 33.179688-22.691406 33.179688-43.414062 0-11.515625-4.355469-22.03125-11.496094-30 7.144532-7.96875 11.496094-18.484375 11.496094-30s-4.355469-22.03125-11.496094-30c7.144532-7.96875 11.496094-18.484375 11.496094-30 0-24.8125-20.1875-45-45-45h-82.105469c1.164063-2.757812 2.367188-5.554688 3.59375-8.398438 9.101563-21.105468 18.511719-42.929687 18.511719-66.601562 0-41.460938-33.535156-76-75-76-7.148438 0-13.304688 5.046875-14.707031 12.058594l-7.660157 38.300781c-10.0625 50.304687-21.175781 56-62.523437 77.1875-10.929687 5.597656-23.769531 12.179687-38.753906 20.722656-6.898438-16.019531-22.835938-27.269531-41.355469-27.269531h-90c-8.285156 0-15 6.714844-15 15zm198.785156-251.753906c22.390625-11.472656 38.5625-19.757813 51.226563-33.785156 12.949219-14.347657 20.785156-32.953126 27.039062-64.21875l4.902344-24.523438c18.8125 5.507812 33.046875 23.558594 33.046875 44.28125 0 17.476562-8.164062 36.410156-16.0625 54.722656-2.863281 6.644532-5.785156 13.4375-8.386719 20.277344h-20.550781c-8.285156 0-15 6.714844-15 15s6.714844 15 15 15h135c8.269531 0 15 6.730469 15 15s-6.730469 15-15 15h-30c-8.285156 0-15 6.714844-15 15s6.714844 15 15 15h30c8.269531 0 15 6.730469 15 15s-6.730469 15-15 15h-30c-8.285156 0-15 6.714844-15 15s6.714844 15 15 15h30c8.269531 0 15 6.730469 15 15s-6.730469 15-15 15h-30c-8.285156 0-15 6.714844-15 15s6.714844 15 15 15c8.269531 0 15 6.730469 15 15s-6.730469 15-15 15h-121.578125c-35.160156 0-69.921875-5.34375-103.421875-15.875v-194.253906c19.339844-11.53125 35.515625-19.824219 48.785156-26.625zm-168.785156-3.246094h75c8.269531 0 15 6.730469 15 15v210c0 8.269531-6.730469 15-15 15h-75zm0 0" />
                        <path
                          d="m90 437c0 8.285156-6.714844 15-15 15s-15-6.714844-15-15 6.714844-15 15-15 15 6.714844 15 15zm0 0" />
                        <path
                          d="m270 15v31c0 8.285156 6.714844 15 15 15s15-6.714844 15-15v-31c0-8.285156-6.714844-15-15-15s-15 6.714844-15 15zm0 0" />
                        <path
                          d="m364.394531 39.785156-21.214843 21.214844c-5.859376 5.859375-5.859376 15.355469 0 21.214844 5.859374 5.855468 15.355468 5.855468 21.214843 0l21.210938-21.214844c5.859375-5.859375 5.859375-15.355469 0-21.214844-5.859375-5.855468-15.355469-5.855468-21.210938 0zm0 0" />
                        <path
                          d="m184.394531 39.785156c-5.859375 5.859375-5.859375 15.355469 0 21.214844l21.210938 21.214844c5.859375 5.855468 15.355469 5.855468 21.214843 0 5.855469-5.859375 5.855469-15.355469 0-21.214844l-21.214843-21.214844c-5.855469-5.855468-15.355469-5.855468-21.210938 0zm0 0" />
                      </svg>

                      <svg class="d-none mx-2 likedBtn" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1"
                        width="18" height="18" x="0" y="0" viewBox="0 0 512 512"
                        style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
                        <g>
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m300 15v31c0 8.398438-6.597656 15-15 15s-15-6.601562-15-15v-31c0-8.402344 6.597656-15 15-15s15 6.597656 15 15zm0 0"
                            fill="#fc0ff5" data-original="#ffd400" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m353.789062 86.605469c-3.839843 0-7.675781-1.464844-10.605468-4.394531-5.859375-5.859376-5.859375-15.351563 0-21.210938l21.210937-21.210938c5.859375-5.859374 15.351563-5.859374 21.210938 0 5.859375 5.859376 5.859375 15.351563 0 21.210938l-21.210938 21.210938c-2.929687 2.929687-6.765625 4.394531-10.605469 4.394531zm0 0"
                            fill="#fc0ff5" data-original="#fdbf00" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m216.210938 86.605469c-3.839844 0-7.675782-1.464844-10.605469-4.394531l-21.210938-21.210938c-5.859375-5.859375-5.859375-15.351562 0-21.210938 5.859375-5.859374 15.351563-5.859374 21.210938 0l21.210937 21.210938c5.859375 5.859375 5.859375 15.351562 0 21.210938-2.929687 2.929687-6.765625 4.394531-10.605468 4.394531zm0 0"
                            fill="#fc0ff5" data-original="#ffd400" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m416.398438 377c18.601562 0 33.601562 15 33.601562 33.601562 0 18.898438-15 33.296876-33.601562 33.296876h-30c18.601562 0 33.601562 15.601562 33.601562 34.5 0 18.601562-15 33.601562-33.601562 33.601562 0 0-62.097657 0-101.398438 0h-31.5c-40.5 0-80.398438-6.601562-118.800781-19.199219l-6-2.101562-27-220.5c115.199219-80.101563 143.101562-53.800781 160.5-140.800781l5.097656-24.597657c1.800781-8.402343 9.601563-13.800781 17.703125-11.699219h.902344c26.097656 7.199219 44.097656 31.898438 44.097656 58.898438 0 20.699219-8.699219 41.101562-17.402344 60.597656-4.199218 9.902344-8.398437 19.503906-11.398437 29.402344h115.199219c18.601562 0 33.601562 15 33.601562 33.601562 0 18.898438-15 33.898438-33.601562 33.898438 18.601562 0 33.601562 15 33.601562 33.898438 0 18.601562-15 33.601562-33.601562 33.601562zm0 0"
                            fill="#122c5a" data-original="#ffcebf" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m285 61v-61c8.402344 0 15 6.597656 15 15v31c0 8.398438-6.597656 15-15 15zm0 0"
                            fill="#fc0ff5" data-original="#fdbf00" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m416.398438 377c18.601562 0 33.601562 15 33.601562 33.601562 0 18.898438-15 33.296876-33.601562 33.296876h-30c18.601562 0 33.601562 15.601562 33.601562 34.5 0 18.601562-15 33.601562-33.601562 33.601562 0 0-62.097657 0-101.398438 0v-418.898438h.902344c26.097656 7.199219 44.097656 31.898438 44.097656 58.898438 0 20.699219-8.699219 41.101562-17.402344 60.597656-4.199218 9.902344-8.398437 19.503906-11.398437 29.402344h115.199219c18.601562 0 33.601562 15 33.601562 33.601562 0 18.898438-15 33.898438-33.601562 33.898438 18.601562 0 33.601562 15 33.601562 33.898438 0 18.601562-15 33.601562-33.601562 33.601562zm0 0"
                            fill="#122c5a" data-original="#ffbfab" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m105 512h-90c-8.289062 0-15-6.710938-15-15v-270c0-8.289062 6.710938-15 15-15h90c24.8125 0 45 20.1875 45 45v210c0 24.8125-20.1875 45-45 45zm0 0"
                            fill="#8e52f5" data-original="#cb75f6" style="" class="" />
                          <path xmlns="http://www.w3.org/2000/svg"
                            d="m90 437c0 8.285156-6.714844 15-15 15s-15-6.714844-15-15 6.714844-15 15-15 15 6.714844 15 15zm0 0"
                            fill="#68544f" data-original="#68544f" style="" />
                        </g>
                      </svg>

                      <span>${eReply.likes}</span>
                      <!-- 倒讚 -->
                      <div class="mx-3 unlikeBtn"><svg height="18" viewBox="0 -13 512 512" width="18"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="m512 196.914062c0-19.902343-11.570312-37.144531-28.335938-45.375 4.457032-7.523437 7.027344-16.292968 7.027344-25.65625 0-21.566406-13.589844-40.011718-32.65625-47.242187 3.804688-7.09375 5.96875-15.195313 5.96875-23.789063 0-27.855468-22.660156-50.515624-50.515625-50.515624h-229.007812l-59.695313 22.515624v-26.851562h-124.785156v336.253906h124.785156v-28.636718h17.15625l94.230469 109.011718 8.097656 44.613282c2.5625 14.105468 14.824219 24.34375 29.164063 24.34375h17.332031c33.371094 0 60.523437-27.152344 60.523437-60.523438 0-20.976562-4.035156-41.445312-11.996093-60.851562l-17.984375-45.75h125.019531c27.855469 0 50.519531-22.660157 50.519531-50.515626 0-10.433593-3.183594-20.140624-8.625-28.199218 14.265625-8.9375 23.777344-24.792969 23.777344-42.832032zm-482-166.914062h64.785156v276.253906h-64.785156zm416.328125 258.460938h-169.046875l34.132812 86.828124.085938.21875c6.496094 15.796876 9.789062 32.472657 9.789062 49.554688 0 16.832031-13.691406 30.523438-30.523437 30.523438h-17.03125l-9.507813-52.375-108.5625-125.59375h-30.878906v-218.703126l65.164063-24.578124h223.539062c11.3125 0 20.515625 9.203124 20.515625 20.515624s-9.203125 20.515626-20.515625 20.515626h-75.15625v30h101.84375c11.3125 0 20.515625 9.203124 20.515625 20.515624s-9.203125 20.515626-20.515625 20.515626h-75.15625v30h96.464844c11.3125 0 20.515625 9.203124 20.515625 20.515624 0 11.316407-9.203125 20.515626-20.515625 20.515626h-94.0625v30h78.90625c11.316406 0 20.519531 9.203124 20.519531 20.515624 0 11.316407-9.203125 20.515626-20.519531 20.515626zm0 0" />
                        </svg></div>

                      <div class="mx-3 d-none unlikedBtn"><svg xmlns="http://www.w3.org/2000/svg"
                          xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1"
                          width="18" height="18" x="0" y="0" viewBox="0 0 512 511"
                          style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
                          <g>
                            <path xmlns="http://www.w3.org/2000/svg"
                              d="m488.199219 240.261719c5.449219 8.058593 8.648437 17.75 8.648437 28.1875 0 27.851562-22.667968 50.511719-50.519531 50.511719h-125.019531l17.980468 45.75c7.960938 19.410156 12 39.878906 12 60.847656 0 33.382812-27.148437 60.53125-60.527343 60.53125h-17.332031c-14.339844 0-26.601563-10.238282-29.160157-24.351563l-8.097656-44.609375-94.230469-109.007812h-47.160156v-269.449219l89.699219-33.832031h229.007812c27.851563 0 50.511719 22.660156 50.511719 50.511718 0 8.597657-2.171875 16.6875-5.980469 23.777344 19.070313 7.230469 32.671875 25.679688 32.671875 47.25 0 9.371094-2.570312 18.140625-7.019531 25.660156 8.199219 4.019532 15.148437 10.210938 20.109375 17.800782 5.199219 7.929687 8.21875 17.410156 8.21875 27.582031 0 18.046875-9.519531 33.90625-23.800781 42.839844zm0 0"
                              fill="#122c5a" data-original="#ffcdc0" style="" class="" />
                            <path xmlns="http://www.w3.org/2000/svg"
                              d="m488.199219 240.261719c5.449219 8.058593 8.648437 17.75 8.648437 28.1875 0 27.851562-22.667968 50.511719-50.519531 50.511719h-125.019531l17.980468 45.75c7.960938 19.410156 12 39.878906 12 60.847656 0 33.382812-27.148437 60.53125-60.527343 60.53125h-17.332031c-14.339844 0-26.601563-10.238282-29.160157-24.351563l-8.097656-44.609375-94.230469-109.007812h-47.160156v-138.28125h409c5.199219 7.929687 8.21875 17.410156 8.21875 27.582031 0 18.046875-9.519531 33.90625-23.800781 42.839844zm0 0"
                              fill="#122c5a" data-original="#ffb99d" style="" class="" />
                            <path xmlns="http://www.w3.org/2000/svg" d="m0 .5h114v336.25h-114zm0 0" fill="#8e52f5"
                              data-original="#fc4a48" style="" class="" />
                            <path xmlns="http://www.w3.org/2000/svg" d="m0 169.839844h114v166.910156h-114zm0 0"
                              fill="#8e52f5" data-original="#fc1c5c" style="" class="" />
                          </g>
                        </svg></div>




                    </div>
                  </div>
                </div>`;
          document
            .querySelector(`#commentTextCol${e.comment_id}`)
            .appendChild(replyComment);
        });
      }
    });
  });

$("#non-subscribe").click(function () {
  fetch("/user/subscribe", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: articleApiBody,
  })
    .then((res) => res.json())
    .then((json) => {})
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "已訂閱",
        showConfirmButton: false,
        timer: 1500,
      });
    });
});
$("#subscribed").click(function () {
  fetch("/user/unsubscribe", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: articleApiBody,
  })
    .then((res) => res.json())
    .then((json) => {})
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "已取消訂閱",
        showConfirmButton: false,
        timer: 1500,
      });
    });
});

$("#newCollectionBtn").click(function () {
  let newCollectionList = {
    collectionName: $("#newCollectionInput").val(),
  };
  fetch("/user/newCollectionList", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCollectionList),
  })
    .then((json) => {})
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "已新增收藏清單",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .then(() => {
      location.reload();
    });
});

$("#newCommentBtn").click(function () {
  let commentData = {
    articleId: $("#articleId").text(),
    commentInput: $(".newCommentMain").val(),
    fatherComment: "",
  };
  fetch("/articles/newComment", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  })
    .then((json) => {})
    .then(() => {
      location.reload();
    });
});

$("#non-likeBtnMain").click(function () {
  const likeBody = {
    category: 1,
    articleId: $("#articleId").text(),
  };
  fetch("/articles/likeBtn", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(likeBody),
  }).then((json) => {});
});
$("#dislikeBtnMain").click(function () {
  const likeBody = {
    category: 0,
    articleId: $("#articleId").text(),
  };
  fetch("/articles/likeBtn", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(likeBody),
  }).then((json) => {});
});
$("#likedBtn").click(function () {
  const likeBody = {
    category: 1,
    articleId: $("#articleId").text(),
  };
  fetch("/articles/clickedBtn", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(likeBody),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {});
});
$("#dislikedBtn").click(function () {
  const likeBody = {
    category: 0,
    articleId: $("#articleId").text(),
  };
  fetch("/articles/clickedBtn", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(likeBody),
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {});
});

// 訂閱按鈕 ok
const nonSubBtn = document.querySelector(".non-subscribe");
const subedBtn = document.querySelector(".subscribed");
nonSubBtn.addEventListener("click", () => {
  nonSubBtn.classList.toggle("d-none");
  subedBtn.classList.toggle("d-none");
});

subedBtn.addEventListener("click", () => {
  nonSubBtn.classList.toggle("d-none");
  subedBtn.classList.toggle("d-none");
});

// 按收藏 ok
// const uncollectBtn = document.querySelector(".uncollect")
// const collectedBtn = document.querySelector(".collected")
// uncollectBtn.addEventListener("click", () => {
//   uncollectBtn.classList.toggle("d-none")
//   collectedBtn.classList.toggle("d-none")
// })

// collectedBtn.addEventListener("click", () => {
//   uncollectBtn.classList.toggle("d-none")
//   collectedBtn.classList.toggle("d-none")
// })

// 按讚 倒讚
const likeSvg = document.querySelector(".likeSvg");
const likedSvg = document.querySelector(".likedSvg");
const dislikeSvg = document.querySelector(".dislikeSvg");
const dislikedSvg = document.querySelector(".dislikedSvg");
likeSvg.addEventListener("click", (e) => {
  e.preventDefault();
  let count = 1;
  if (!dislikedSvg.classList.contains("d-none")) {
    count = count + 1;
    dislikeSvg.classList.remove("d-none");
    dislikedSvg.classList.add("d-none");
  }
  likeSvg.classList.add("d-none");
  likedSvg.classList.remove("d-none");
  var likeCount = parseInt($("#likeCount").text());
  likeCount += count;
  $("#likeCount").text(likeCount);
});
dislikeSvg.addEventListener("click", (e) => {
  e.preventDefault();
  let count = 1;
  if (!likedSvg.classList.contains("d-none")) {
    count = count + 1;
    likeSvg.classList.remove("d-none");
    likedSvg.classList.add("d-none");
  }
  dislikeSvg.classList.add("d-none");
  dislikedSvg.classList.remove("d-none");
  var likeCount = parseInt($("#likeCount").text());
  likeCount -= count;
  $("#likeCount").text(likeCount);
});
likedSvg.addEventListener("click", (e) => {
  e.preventDefault();
  let count = 1;
  likedSvg.classList.add("d-none");
  likeSvg.classList.remove("d-none");
  var likeCount = parseInt($("#likeCount").text());
  likeCount -= count;
  $("#likeCount").text(likeCount);
});

dislikedSvg.addEventListener("click", (e) => {
  e.preventDefault();
  let count = 1;
  dislikedSvg.classList.add("d-none");
  dislikeSvg.classList.remove("d-none");
  var likeCount = parseInt($("#likeCount").text());
  likeCount += count;
  $("#likeCount").text(likeCount);
});
