document.addEventListener("DOMContentLoaded", () => {
  let wrapper = document.querySelector(".card-text");
  let options = {
    //選項放在這裡
    height: null,
    truncate: "word",
  };
  let dot = new Dotdotdot(wrapper, options);
  dot.API.truncate();
});
