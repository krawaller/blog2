function makePostList(data, postIds) {
  const list = postIds
    .sort((k1, k2) => {
      return data.posts[k1].attributes.date < data.posts[k2].attributes.date
        ? 1
        : -1;
    })
    .map(
      (postId, n) =>
        `<li><Link href="/posts/${data.posts[postId].attributes.url}"${
          n < 5 ? " prefetch" : ""
        }><a>${data.posts[postId].attributes.date}: ${data.posts[
          postId
        ].attributes.title
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")}</a></Link></li>`
    );
  return `<ul>\n${list.join("\n")}\n</ul>`;
}

module.exports = makePostList;
