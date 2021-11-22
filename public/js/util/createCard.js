const createCard = function (json) {
  json.forEach((e) => {
    const card = document.createElement("div");
    e.pureText = jQuery(e.content_html).text();
    card.setAttribute("class", "box col-6");
    card.innerHTML = `        <div class="w3-margin row w3-border-bottom g-0 bg-light position-relative articleCard" style="height:300px;border-radius:10px">
          <div class="col-md-6 mb-md-0 p-md-4 col-3">
            <a href="/articles/${e.slug}">
              <div style="width:243px;height:243px;border-radius:10px;background-repeat:no-repeat;
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
        </div>`;
    document.querySelector(".articleWrapper").appendChild(card);
  });
};

export { createCard };
