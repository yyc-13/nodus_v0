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

const sidebarUrl = "/user/authenticateonly";
fetch(sidebarUrl, {
  method: "GET",
})
  .then((res) => {
    if (res.status !== 200) {
      document.querySelector(".logout").classList.add("d-none");
    } else {
      document.querySelector(".login").classList.add("d-none");
    }
  })
  .catch((err) => {
    console.error(err);
  });

document.querySelector(".login").addEventListener("click", (e) => {
  e.preventDefault();
  self.location.href = "/user/profile";
});

document.querySelector(".logout").addEventListener("click", (e) => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expired_time");
  fetch("/user/deletecookie", {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
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
