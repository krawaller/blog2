const fs = require("fs-extra");
const path = require("path");

function makeIndex(data, outputRoot) {
  console.log("Creating index");

  const list = Object.keys(data.posts).map(
    postId =>
      `<li><Link href="/posts/${
        data.posts[postId].attributes.url
      }" prefetch><a>${data.posts[postId].attributes.title
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
