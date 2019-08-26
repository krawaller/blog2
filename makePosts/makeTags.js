const fs = require("fs-extra");
const path = require("path");

const makePostList = require("./makePostList");

function writeTag(data, tagId, outputRoot) {
  console.log("Creating component for tag", tagId);
  const posts = data.tags[tagId];
  const count = posts.length;
  const compName =
    "Tag" +
    tagId[0].toUpperCase() +
    tagId
      .slice(1)
      .replace(" ", "_")
      .replace("-", "_");
  const fileName = tagId.toLowerCase().replace(" ", "_");
  const file = `
import React from 'react';
import Master from '../../components/master';
import Link from 'next/link';

const ${compName} = () => (
  <Master kind="tag" title="${tagId}" summary="Posts about ${tagId}">
    <div className="tag" data-tagid="${tagId}">
      <p>There ${count === 1 ? "is" : "are"} ${count} post${
    count === 1 ? "" : "s"
  } tagged with ${tagId}:</p>
      ${makePostList(data, posts)}
    </div>
  </Master>
);

export default ${compName};
`;
  const out = path.join(outputRoot, "pages", "tags");
  fs.ensureDirSync(out);
  fs.writeFileSync(path.join(out, fileName + ".js"), file);
}

function makeTags(data, outputRoot) {
  Object.keys(data.tags).forEach(tagId => writeTag(data, tagId, outputRoot));
}

module.exports = makeTags;
