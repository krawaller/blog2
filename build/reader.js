const fs = require("fs-extra");
const fm = require("front-matter");
const path = require("path");

function readSource(dir) {
  const postList = fs
    .readdirSync(dir)
    .filter(f => f !== ".DS_Store")
    .map(fname => {
      const postFile = fs
        .readFileSync(path.join(dir, fname, "post.md"))
        .toString();
      const { attributes, body } = fm(postFile);
      attributes.folder = fname;
      attributes.hasStaticContent = fs.existsSync(
        path.join(dir, fname, "static")
      );
      return { attributes, body };
    });
  const authors = postList.reduce(
    (mem, post) => ({
      ...mem,
      [post.attributes.author]: (mem[post.attributes.author] || []).concat(
        post.attributes.id
      )
    }),
    {}
  );
  const tags = postList.reduce(
    (mem, post) => ({
      ...mem,
      ...post.attributes.tags.reduce(
        (innerMem, tagId) => ({
          ...innerMem,
          [tagId]: (mem[tagId] || []).concat(post.attributes.id)
        }),
        {}
      )
    }),
    {}
  );
  const posts = postList.reduce(
    (mem, post) => ({
      ...mem,
      [post.attributes.id]: post
    }),
    {}
  );

  const postsByUrl = postList.reduce(
    (mem, post) => ({
      ...mem,
      [post.attributes.url]: post.attributes.id
    }),
    {}
  );

  return { posts, authors, tags, postsByUrl };
}

module.exports = readSource;
