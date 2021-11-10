// function dynamicallyLoadScript(url, integrity, crossorigin) {
//   var script = document.createElement("script"); // create a script DOM node
//   script.src = url; // set its src to the provided URL
//   if (integrity !== undefined && typeof crossorigin !== undefined) {
//     console.log(integrity);
//     script.integrity = integrity;

//     script.crossOrigin = crossorigin;
//     console.log(script.crossorigin + crossorigin);
//     console.log(script);
//   }

//   document.body.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
// }

// dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");

// dynamicallyLoadScript(
//   "https://code.jquery.com/jquery-3.6.0.min.js",
//   "sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=",
//   "anonymous"
// );

const url = "/search/getHotTags";
fetch(url, {
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
