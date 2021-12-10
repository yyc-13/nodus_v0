document.addEventListener("DOMContentLoaded", function () {
  const jsForm = document.querySelector(".js-form");
  jsForm.addEventListener("submit", handleSubmit);
  const nextBtn = document.querySelector(".js-next");
  const prevBtn = document.querySelector(".js-prev");
  let resultStats = document.querySelector(".js-result-stats");
  const spinner = document.querySelector(".js-spinner");
  let totalResults;
  let currentPage = 1;
  let searchQuery;

  // Get the modal
  var modal = document.getElementById("id01");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
    currentPage = 1;
    const inputValue = document.querySelector(".js-search-input").value;
    searchQuery = inputValue.trim();

    fetchResults(searchQuery);
  }

  async function fetchResults(searchQuery) {
    spinner.classList.remove("hidden");
    try {
      const results = await searchUnsplash(searchQuery);
      pagination(results.total_pages);

      displayResults(results);
    } catch (err) {
      console.log(err);
      alert("Failed to search Unsplash");
    }
    spinner.classList.add("hidden");
  }

  async function searchUnsplash(searchQuery) {
    const getKeyUrl = `/search/getunsplashapikey`;

    const response1 = await fetch(getKeyUrl);
    const apiKey = await response1.json();

    const endpoint = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=30&page=${currentPage}&client_id=${apiKey}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    return json;
  }

  function pagination(totalPages) {
    nextBtn.classList.remove("hidden");
    if (currentPage >= totalPages) {
      nextBtn.classList.add("hidden");
    }

    prevBtn.classList.add("hidden");
    if (currentPage !== 1) {
      prevBtn.classList.remove("hidden");
    }
  }

  document.querySelector("#showUnsplash").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("id01").style.display = "block";
  });
  // onclick = "document.getElementById('id01').style.display='block'";
  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    currentPage += 1;
    fetchResults(searchQuery);
  });

  prevBtn.addEventListener("click", (event) => {
    event.preventDefault();
    currentPage -= 1;
    fetchResults(searchQuery);
  });

  function displayResults(json) {
    const searchResults = document.querySelector("#imgContainer");
    searchResults.textContent = "";
    json.results.forEach((result) => {
      const url = result.urls.small;
      const regUrl = result.urls.regular;
      const unsplashLink = result.links.html;
      const photographer = result.user.name;
      const photographerPage = result.user.links.html;
      const imgLi = document.createElement("li");
      imgLi.setAttribute("class", `imgLi`);
      imgLi.setAttribute("data-imgUrl", regUrl);
      // <a href="${unsplashLink}" target="_blank"></a>;
      imgLi.innerHTML = `<span class="imgSpan">
    <img src=${url}></span>
					`;
      imgLi.addEventListener("click", (event) => {
        event.preventDefault();
        Swal.fire({
          title: "選擇作為封面照片？",

          showCancelButton: true,
          confirmButtonText: "選擇",
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            modal.style.display = "none";
            const imgUrl = imgLi.getAttribute("data-imgUrl");
            $("#imgPreview").css("background-image", `url(${imgUrl})`);
            $("#imgPreview").attr("data-imgUrl", `${imgUrl}`);
            $("#imgPreview").attr("data-type", `unsplash`);
            document.querySelector("#articleCover").value = "";
          } else if (result.isDenied) {
            Swal.fire("Changes are not saved", "", "info");
          }
        });
      });
      searchResults.appendChild(imgLi);
    });
    totalResults = json.total;
    resultStats.textContent = `About ${totalResults} results found`;
  }
});
// document.querySelector("#artCoverBtn").addEventListener("click",(e)=>{
//   e.preventDefault()

// })
