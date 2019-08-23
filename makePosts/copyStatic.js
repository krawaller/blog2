const fs = require("fs-extra");
const path = require("path");

function copyStatic(data, outputRoot) {
  Object.keys(data.posts).forEach(postId => {
    const post = data.posts[postId];
    if (post.attributes.hasStaticContent) {
      console.log("Copying static content for post", postId);
      const source = path.join(post.attributes.folder, "__STATIC__");
      const target = path.join(
        outputRoot,
        "static",
        "posts",
        post.attributes.url
      );
      fs.ensureDirSync(target);
      fs.copySync(source, target);
    }
  });
}

module.exports = copyStatic;
