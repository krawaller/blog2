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
      .replace(/\n/g, "<br/>")
      .replace(
        /<(.*?) class="([^"]*)"([^>]*)>/g,
        (full, before, cls, after) => `<${before} className="${cls}"${after}>`
      );
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

  codeBlocks = [];

  res = res.replace(/\n```[\s\S]*?\n```/g, full => {
    codeBlocks.push(full);
    return `\n;;;;;CODEBLOCK${codeBlocks.length};;;;;\n`;
  });

  res = "\n" + res;
  res = res.replace(/\n###([^ ])/g, "\n### $1");
  res = res.replace(
    /\.\/static\//g,
    "../static/posts/" + post.attributes.url + "/"
  );
  res = res.replace(/ class='([^']*)'/g, ' className="$1"');
  res = res.replace(/ style='([^']*)'/g, ' style="$1"');

  res = res.replace(/ class="([^"]*)"/g, ' className="$1"');

  res = marked(res);
  res = res.replace(/style="([^"]*)"/g, (full, css) => {
    return `style={${JSON.stringify(toObject(css.replace(/;$/, "")))}}`;
  });
  res = res.replace(/<img ([^>]*)([^\/>])>/g, "<img $1$2/>");
  res = res.replace(
    /<a ([^>]*?)href="..\/([^"]*?)"([^>]*?)>(.*?)<\/a>/g,
    (full, before, url, after, text) => {
      return `<Link ${before}href="/posts/${url.replace(
        /\/$/,
        ""
      )}"${after} prefetch><a>${text}</a></Link>`;
    }
  );

  res = res.replace(/<p>;;;;;CODEBLOCK(\d*);;;;;<\/p>/g, function(full, nbr) {
    return marked(codeBlocks[+nbr - 1]);
  });

  res = res.replace(
    /<code class="language-/g,
    '<code className="hljs language-'
  );
  res = res.replace(/<pre>\s*<code>/g, '<pre><code className="hljs">');

  res = res.replace(
    /<(.*?) class="([^"]*)"([^>]*?)>/g,
    (full, before, cls, after) => `<${before} className="${cls}"${after}>`
  );
  res = res.replace(/<span class="xml">/g, '<span className="xml">');
  res = res.replace(
    /<iframe(.*?) src="(.*?)\/([^"]*)"(.*?)>/,
    (full, before, urlStart, folder, after) => {
      let [fixed, hash] = folder.split("#");

      if (!fixed.match(/\.html?$/)) {
        fixed = fixed + (fixed.match(/\/$/) ? "" : "/") + "index.html";
      }
      return `<iframe${before} src="${urlStart}/${fixed}${
        hash ? "#" + hash : ""
      }"${after}>`;
    }
  );
  res = res.replace(
    /<code>(.*?)\{(.*?)<\/code>/g,
    (full, before, after) => `<code>${before}&#123;${after}</code>`
  );

  res = res.replace(
    /<script([^>]*?)>([\S\s]*?)<\/script>/g,
    (full, attrs, content) =>
      `<script${attrs} dangerouslySetInnerHTML={{__html: \`${content.replace(
        /`/g,
        "\\`"
      )}\`}}/>`
  );

  res = res.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/g,
    (full, attrs, content) => `<style${attrs} jsx>{\`${content}\`}</style>`
  );
  return res;
}

module.exports = process;
