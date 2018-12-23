const fs = require("fs-extra");
const path = require("path");

const makePostList = require("./makePostList");

function makeIndex(data, outputRoot) {
  console.log("Creating index");

  const list = makePostList(data, Object.keys(data.posts));
  const file = `
import React from 'react';
import Master from '../components/master';
import Link from 'next/link';

const BlogIndex = () => (
  <Master title="Krawaller" summary="awesome web blog">
    <div className="index">
      ${list}
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
