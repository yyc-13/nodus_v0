fetch("/user/subscription", {
  method: "POST",
  credentials: "include",
})
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json == -1) {
      swal.fire("請先登入");
      return;
    }
    json.forEach((e) => {
      if (e.sub_count == null) {
        e.sub_count = 0;
      }
      const card = document.createElement("div");
      card.setAttribute("class", "wholeCard card col-3");
      card.style.width = "18rem";
      card.innerHTML = `      <a href="/user/${e.url_id}">          <div class="subCard" style="background-image:url(${e.profile_pic})"></div>

                <div class="card-body">
                  <h4 class="card-title">${e.name}• 訂閱人數 ${e.sub_count}</h4>
                  <h5 class="text-secondary card-text">${e.channel_title}
                  </h5>
                  <p class="card-text">${e.channel_description}
                  </p>

                </div>
                </a>`;
      document.querySelector(".cardWrapper").appendChild(card);
    });
  });
