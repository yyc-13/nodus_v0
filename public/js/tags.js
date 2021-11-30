const tagUrl = "/search/getHotTags";
fetch(tagUrl, {
  method: "GET",
})
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    var html = ejs.render(
      `
    <% tags.forEach(e =>{ %>
    <a href="/search/tag?q=<%= e.tag %>"><%= e.tag %></a>
    <% }) %>`,
      { tags: res }
    );
    document.querySelector(".scrollmenu").innerHTML = html;
  });
