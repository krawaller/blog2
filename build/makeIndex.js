const fs = require("fs-extra");
const path = require("path");

function makeIndex(data, outputRoot) {
  console.log("Creating index");

  const list = Object.keys(data.posts)
    .sort((k1, k2) => {
      return data.posts[k1].attributes.date < data.posts[k2].attributes.date
        ? 1
        : -1;
    })
    .map(
      postId =>
        `<li><Link href="/posts/${data.posts[postId].attributes.url}"><a>${
          data.posts[postId].attributes.date
        }: ${data.posts[postId].attributes.title
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")}</a></Link></li>`
    );

  const file = `
import React from 'react';
import Master from '../components/master';
import Link from 'next/link';

const BlogIndex = () => (
  <Master title="Krawaller" summary="awesome web blog">
    <div className="index">
      <ul>
        ${list.join("\n        ")}
      </ul>
    </div>
  </Master>
);

export default BlogIndex;
`;
  const out = path.join(outputRoot, "pages");
  fs.ensureDirSync(out);
  fs.writeFileSync(path.join(out, "index.js"), file);
}

module.exports = makeIndex;
