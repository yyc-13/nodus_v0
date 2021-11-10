const url = "/user/login";

const button = document.querySelector("#sign_in_button");

button.addEventListener("click", function (e) {
  const user = {
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value,
  };
  console.log(user);
  e.preventDefault();
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((res) => {
      console.log(res.body);
      return res.json();
    })
    .then((res) => {
      console.log(res);
      const expired_time = Date.now() + 3600 * 1000;
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("expired_time", expired_time);
    })
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "登入成功",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        self.location.href = "/"; // 等個人頁面完成轉跳到 userArticle.html
      });
    })
    .catch((err) => {
      alert("登入失敗，請再試一次");
      console.error(err);
    });
});

const url_register = "/user/register";
const button_signup = document.querySelector("#sign_up_button");
button_signup.addEventListener("click", (e) => {
  e.preventDefault();
  const user = {
    name: document.querySelector("#name_up").value,
    email: document.querySelector("#email_up").value,
    password: document.querySelector("#password_up").value,
  };
  console.log("user" + user);
  console.log(JSON.stringify(user));
  fetch(url_register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((res) => {
      console.log(res);
      if (res.status == "email have been registered.") {
        alert("email have been registered.");
        // self.location.href = "/user/sign";
        throw -1;
      }

      const expired_time = Date.now() + 3600 * 1000;
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("expired_time", expired_time);
    })
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "註冊成功",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        self.location.href = "/"; // 等個人頁面完整轉跳到 userArticle.html
      });
    })
    .catch((err) => {
      if (err == -1) {
        alert("email have been registered.");
      }
      console.log(err);
    });
});
