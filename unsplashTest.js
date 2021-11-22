require("dotenv").config();
const createApi = require("unsplash-js").createApi;
const nodeFetch = require("node-fetch");
const { ACCESS_TOKEN_SECRET, UNSPLASH_ACCESS_KEY, UNSPLASH_SECRET_KEY } =
  process.env;

const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch,
});

// non-feed example
unsplash.photos.get({ photoId: "cook" }).then((result) => {
  if (result.errors) {
    // handle error here
    console.log("error occurred: ", result.errors[0]);
  } else {
    // handle success here
    const photo = result.response;
    console.log(photo);
  }
});

// feed example
unsplash.users.getPhotos({ username: "artbbkv" }).then((result) => {
  if (result.errors) {
    // handle error here
    console.log("error occurred: ", result.errors[0]);
  } else {
    const feed = result.response;

    // extract total and results array from response
    const { total, results } = feed;

    // handle success here
    console.log(`received ${results.length} photos out of ${total}`);
    console.log("first photo: ", results[0]);
  }
});
