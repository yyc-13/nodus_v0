function setFormMessage(formElement, type, message) {
  const messageElement = formElement.querySelector(".form__message");

  messageElement.textContent = message;
  messageElement.classList.remove(
    "form__message--success",
    "form__message--error"
  );
  messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
  inputElement.classList.add("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = message;
}

function clearInputError(inputElement) {
  inputElement.classList.remove("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = "";
}

function validate_email(field, alerttxt) {
  with (field) {
    apos = value.indexOf("@");
    dotpos = value.lastIndexOf(".");
    if (apos < 1 || dotpos - apos < 2) {
      Swal.fire("請輸入正確的 Email");
      return false;
    } else {
      return true;
    }
  }
}
function validate_password(fld) {
  var error = "";
  var illegalChars = /[\W_]/; // allow only letters and numbers

  if (fld.value == "") {
    fld.style.background = "Yellow";
    error = "請輸入密碼";
    Swal.fire(error);
    return false;
  } else if (fld.value.length < 7 || fld.value.length > 15) {
    error = "請輸入 8-14 位的密碼";
    fld.style.background = "Yellow";
    Swal.fire(error);
    return false;
  } else if (illegalChars.test(fld.value)) {
    error = "請輸入合法的字元";
    fld.style.background = "Yellow";
    Swal.fire(error);
    return false;
  } else if (
    fld.value.search(/[a-zA-Z]+/) == -1 ||
    fld.value.search(/[0-9]+/) == -1
  ) {
    error = "需要最少一個字元與數字";
    fld.style.background = "Yellow";
    Swal.fire(error);
    return false;
  } else {
    fld.style.background = "White";
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login");
  const signupForm = document.querySelector("#createAccount");

  document
    .querySelector("#linkCreateAccount")
    .addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("form--hidden");
      signupForm.classList.remove("form--hidden");
    });

  document.querySelector("#linkLogin").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("form--hidden");
    signupForm.classList.add("form--hidden");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = {
      email: document.querySelector("#loginEmail").value,
      password: document.querySelector("#loginPassword").value,
    };
    // Perform your AJAX/Fetch login
    const url = "/user/login";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json == "請輸入正確的 Email 和密碼") {
          throw "請輸入正確的 Email 和密碼";
        }
        const expired_time = Date.now() + 3600 * 1000;
        localStorage.setItem("accessToken", json.accessToken);
        localStorage.setItem("expired_time", expired_time);
        return json;
      })
      .then((json) => {
        Swal.fire({
          icon: "success",
          title: "登入成功",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = `/`;
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "請輸入正確的 Email 和密碼",
          showConfirmButton: false,
          timer: 1500,
        });
      });

    // setFormMessage(loginForm, "error", "Invalid username/password combination");
  });
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate_email(document.querySelector("#signupEmail"))) {
      return;
    }
    if (!validate_password(document.querySelector("#signupPassword"))) {
      return;
    }
    if (
      document.querySelector("#authPassword").value !==
      document.querySelector("#signupPassword").value
    ) {
      Swal.fire("密碼與驗證密碼不同")
        .then(() => {
          throw new Error("error");
        })
        .catch((err) => {
          return;
        });
      return;
    }
    const user = {
      name: document.querySelector("#signupUsername").value,
      email: document.querySelector("#signupEmail").value,
      password: document.querySelector("#signupPassword").value,
    };
    // Perform your AJAX/Fetch login
    const url = "/user/register";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status == "email have been registered.") {
          throw "Email 已經註冊過";
        }

        const expired_time = Date.now() + 3600 * 1000;
        localStorage.setItem("accessToken", json.accessToken);
        localStorage.setItem("expired_time", expired_time);
        return json;
      })
      .then((json) => {
        Swal.fire({
          icon: "success",
          title: "註冊成功",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = `/user/${json.user.url_id}`;
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: err,
          showConfirmButton: false,
          timer: 1500,
        });
      });

    // setFormMessage(loginForm, "error", "Invalid username/password combination");
  });

  document.querySelectorAll(".form__input").forEach((inputElement) => {
    inputElement.addEventListener("blur", (e) => {});

    inputElement.addEventListener("input", (e) => {
      clearInputError(inputElement);
    });
  });
});
