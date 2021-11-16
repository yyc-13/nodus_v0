// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
function dynamicallyLoadScript(url) {
  var script = document.createElement("script"); // create a script DOM node
  script.src = url; // set its src to the provided URL

  document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

dynamicallyLoadScript("https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js");

/* global bootstrap: false */
(function () {
  "use strict";
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
})();

// dropdown of 分類看板 & 收藏清單
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}

const logoutBtn = document.querySelector(".logout");

logoutBtn.addEventListener("click", (e) => {
  console.log(1);
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expired_time");
  fetch("/user/deletecookie", {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      console.log(2);
      Swal.fire({
        icon: "success",
        title: "成功登出",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        self.location.href = "/";
      });
    });
});
