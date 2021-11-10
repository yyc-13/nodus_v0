// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
function dynamicallyLoadScript(url) {
  var script = document.createElement("script"); // create a script DOM node
  script.src = url; // set its src to the provided URL

  document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");

const searchBtn = document.querySelector(".search-button");
searchBtn.addEventListener("click", async (e) => {
  searchFunc();
});

document.onkeydown = function (ev) {
  let searchInputTag = document.querySelector(".search-input");
  var event = ev || event;
  if (event.keyCode == 13) {
    if (document.activeElement == searchInputTag) {
      searchFunc();
    }
  }
};

function searchFunc() {
  try {
    let searchInput = document.querySelector(".search-input").value;

    console.log(typeof searchInput);
    searchInput = searchInput.split(/\s+/);
    console.log(searchInput);
    const searchParams = searchInput.join("+");
    console.log(searchParams);
    let baseURL = "http://localhost:3007";
    // 之後可以把 baseURL 放在 env 裡，讓 ec2 也可以直接用
    console.log("我要轉跳囉");
    window.location.href =
      `${baseURL}` + "/search" + "/keywords" + "?search_query=" + searchParams;
  } catch (err) {
    console.log(err);
  }
}

const toggleBtn = document.querySelector(".sidebar-toggle");
const sidebar = document.querySelector("#sidebar");
const toggleSVG = document.querySelector(".bi-list");
let x = 90;
toggleBtn.addEventListener("click", function () {
  x += 90;
  toggleSVG.setAttribute("transform", `rotate(${x})`);
  sidebar.classList.toggle("sidebar");
  sidebar.classList.toggle("show-sidebar");
});

const uploadBtn = document.querySelector("#uploadArticle");
uploadBtn.addEventListener("click", function (e) {
  e.preventDefault();
  Swal.fire({
    title: "<strong>選擇文章編輯方式</strong>",

    html:
      '<div class="container row">' +
      '<div class="card col mx-3" style="width: 400px">' +
      '<div class="card-body">' +
      '<h4 class="card-title">使用 Makrdown 編輯器</h4>' +
      '<p class="card-text-swal">' +
      "Markdown 是工程界常用來撰寫文檔的語言，使用者可以以純文字的方式編寫與排版，而不需要透過其它工具來切換格式。" +
      "</p>" +
      '<a href="/articles/newmd" class="btn btn-primary">I\'m Down!</a>' +
      "</div>" +
      "</div>" +
      '<div class="card col" style="width: 400px">' +
      '<div class="card-body">' +
      '<h4 class="card-title">使用 Medium 編輯器</h4>' +
      '<p class="card-text-swal">' +
      "「所見即所得編輯器。」" +
      "使用一般文字編輯器點選不同工具列表，進行文字編輯與排版，以最直覺的方式撰寫文章。" +
      "</p>" +
      '<a href="/articles/editorjs" class="btn btn-primary">Choose Me!</a>' +
      "</div>" +
      "</div>" +
      "</div>",

    customClass: "swal-wide",
    showCloseButton: true,
    showCancelButton: false, // There won't be any cancel button
    showConfirmButton: false, // There won't be any confirm button
  });
});
