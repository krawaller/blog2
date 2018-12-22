const marked = require("marked");
const hljs = require("highlight.js");
const toObject = require("inline-style-transformer").toObject;

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight(code, lang) {
    const hlCode = lang
      ? hljs.highlight(lang, code).value
      : hljs.highlightAuto(code).value;
    return hlCode
      .replace(/\{/g, "&#123;")
      .replace(/<span class="hljs-/g, '<span className="hljs-')
      .replace(/\n/g, "<br/>");
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: true
});

function process(data, postId) {
  const post = data.posts[postId];
  let res = post.body;

  res = "\n" + res;
  res = res.replace(/\n###([^ ])/g, "\n### $1");
  res = res.replace(
    /\.\/static\//g,
    "../static/posts/" + post.attributes.url + "/"
  );
  res = res.replace(/ class="([^"])"/g, ' className="$1"');
  res = res.replace(/<img ([^>]*)>/g, "<img $1/>");
  res = marked(res);
  res = res.replace(/style="([^"]*)"/g, (full, css) => {
    return `style={${JSON.stringify(toObject(css.replace(/;$/, "")))}}`;
  });
  res = res.replace(
    /<a (.*?)href="..\/(.*?)"(.*?)>(.*?)<\/a>/g,
    (full, before, url, after, text) => {
      return `<Link ${before}href="/posts/${url.replace(
        /\/$/,
        ""
      )}"${after} prefetch><a>${text}</a></Link>`;
    }
  );
  res = res.replace(
    /<code class="language-/g,
    '<code className="hljs language-'
  );
  res = res.replace(/<pre>\s*<code>/g, '<pre><code className="hljs">');
  return res;
}

module.exports = process;
