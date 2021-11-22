const tagUrl = "/search/getHotTags";
fetch(tagUrl, {
  method: "GET",
})
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    console.log(res);
    var html = ejs.render(
      `
    <% tags.forEach(e =>{ %>
    <a href="/search/tag?q=<%= e.tag %>"><%= e.tag %></a>
    <% }) %>`,
      { tags: res }
    );
    // Vanilla JS:
    // document.querySelector(".tags-wrapper").innerHTML = html;
    // $(".scrollmenu").html(html);
    document.querySelector(".scrollmenu").innerHTML = html;
  });
