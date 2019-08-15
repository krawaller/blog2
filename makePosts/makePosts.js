const process = require("./process");
const fs = require("fs-extra");
const path = require("path");

function writeComp(data, postId, outputRoot) {
  console.log("Creating component for post", postId);
  const post = data.posts[postId];
  const compName =
    post.attributes.id[0].toUpperCase() + post.attributes.id.slice(1);
  const tags = post.attributes.tags.map(
    tagId =>
      `<Link href="/tags/${tagId
        .toLowerCase()
        .replace(/ /g, "_")}"><a>${tagId}</a></Link>`
  );
  const file = `
import React from 'react';
import Master from '../../../components/master';
import Link from 'next/link';
${post.attributes.css ? "import Head from 'next/head';" : ""}

const data = ${JSON.stringify(post.attributes)};

const ${compName} = () => (
  <Master kind="post" data={data} title="${post.attributes.title}" summary="${
    post.attributes.excerpt
  }">
    ${
      post.attributes.css
        ? `<Head><link rel="stylesheet" href="../static/posts/${
            post.attributes.url
          }/${post.attributes.css}" /></Head>`
        : ""
    }
    <p>Tags: ${tags.join(" ")}</p>
    <div className="post" data-postid="${post.attributes.id}">
      ${process(data, postId)}
    </div>
    <hr />
  </Master>
);

export default ${compName};
`;
  const out = path.join(outputRoot, "pages", "posts", post.attributes.url);
  fs.ensureDirSync(out);
  fs.writeFileSync(path.join(out, "index.js"), file);
}

function makePosts(data, outputRoot) {
  Object.keys(data.posts).forEach(postId =>
    writeComp(data, postId, outputRoot)
  );
}

module.exports = makePosts;