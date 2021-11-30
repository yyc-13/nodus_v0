fetch("/user/collectionList", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((json) => {
    console.log("json", json);
    if (json.length < 1) {
      Swal.fire("請先登入").then(() => {
        self.location.href = "/";
      });
    }

    for (let [key, value] of Object.entries(json)) {
      // button 的部分
      const collectionBtn = document.createElement("button");
      collectionBtn.setAttribute("onclick", `myFunction('${key}')`);
      collectionBtn.setAttribute(
        "class",
        "w3-margin w3-btn w3-block w3-blue-gray w3-left-align w3-round"
      );
      collectionBtn.innerHTML = `<h4>${key}</h4>`;
      $("#collectionContainer").append(collectionBtn);
      // div 的部分
      const collectionDiv = document.createElement("div");
      collectionDiv.setAttribute("class", "w3-container w3-hide");
      collectionDiv.setAttribute("id", `${key}`);
      collectionDiv.innerHTML = `          <div class="mt-2 col-12 container d-flex flex-row justify-content-evenly" id="articleContainer${key}"></div>`;
      $("#collectionContainer").append(collectionDiv);

      value.forEach((e) => {
        const card = document.createElement("div");
        card.setAttribute("class", "box col-6");
        e.content_html = e.content_html.replace(/(<([^>]+)>)/gi, "");
        card.innerHTML = ` <div class="w3-margin row w3-border-bottom g-0 bg-light position-relative articleCard" style="height:300px;border-radius:10px">
          <div class="col-md-6 mb-md-0 p-md-4 col-3">
            <a href="/articles/${e.slug}">
              <div style="width:200px;height:200px;border-radius:10px;background-repeat:no-repeat;
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
                ${e.content_html}
              </p>
              <h6 class="views text-secondary">觀看次數：${e.views} • 按讚數：${e.likes} </h6>
            </a>

          </div>
        </div>
            `;
        $(`#articleContainer${key}`).append(card);
      });
    }
  });
function myFunction(id) {
  var x = document.getElementById(id);
  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  } else {
    x.className = x.className.replace(" w3-show", "");
  }
}
