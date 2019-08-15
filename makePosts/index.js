const path = require("path");
const fs = require("fs-extra");

const copyStatic = require("./copyStatic");
const reader = require("./reader");
const makePosts = require("./makePosts");
const makeTags = require("./makeTags");
const makeIndex = require("./makeIndex");

const dir = path.join(__dirname, "../sources");
const outputRoot = path.join(__dirname, "../");

fs.removeSync(path.join(outputRoot, "pages/posts"));
fs.removeSync(path.join(outputRoot, "pages/tags"));
fs.removeSync(path.join(outputRoot, "index.js"));

const data = reader(dir);

makeIndex(data, outputRoot);
copyStatic(data, outputRoot);
makePosts(data, outputRoot);
makeTags(data, outputRoot);
