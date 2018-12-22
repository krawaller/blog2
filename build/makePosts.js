const process = require("./process");
const fs = require("fs-extra");
const path = require("path");

function writeComp(data, postId, outputRoot) {
  console.log("Creating component for post", postId);
  const post = data.posts[postId];
  const compName =
    post.attributes.id[0].toUpperCase() + post.attributes.id.slice(1);
  const file = `
import React from 'react';
import Master from '../../components/master';
import Link from 'next/link';

const ${compName} = () => (
  <Master title="${post.attributes.title}" summary="${post.attributes.excerpt}">
    <div className="post" data-postid="${post.attributes.id}">
      ${process(data, postId)}
    </div>
  </Master>
);

export default ${compName};
`;
  const out = path.join(outputRoot, "pages", "posts");
  fs.ensureDirSync(out);
  fs.writeFileSync(path.join(out, post.attributes.url + ".js"), file);
}

function makePosts(data, outputRoot) {
  Object.keys(data.posts).forEach(postId =>
    writeComp(data, postId, outputRoot)
  );
}

module.exports = makePosts;
