const marked = require("marked");
const hljs = require("highlight.js");

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight(code, lang) {
    return hljs.highlight(lang, code).value;
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

function process(data, postId) {
  const post = data.posts[postId];
  let res = post.body;
  res = res.replace(/\.\/static\//g, "../static/" + post.attributes.url + "/");
  return marked(res);
}

module.exports = process;
