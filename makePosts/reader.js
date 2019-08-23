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
      attributes.folder = path.join(dir, fname);
      attributes.hasStaticContent = fs.existsSync(
        path.join(dir, fname, "__STATIC__")
      );
      attributes.excerpt = attributes.excerpt.replace(/"/g, "&quot;");
      attributes.date =
        attributes.date.getFullYear() +
        "-" +
        (attributes.date.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        attributes.date.toString().slice(8, 10);
      attributes.headlines = (("\n" + body).match(/\n#{1,} *.*?\n/g) || []).map(
        str => {
          const match = str.match(/\n(#*) *(.*?)\n/);
          return {
            level: match[1].length,
            text: match[2],
            id: match[2]
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/\W/g, "")
              .replace(/_/g, "-")
              .replace(/-{2,}/g, "-")
          };
        }
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
