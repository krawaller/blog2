const path = require("path");

const copyStatic = require("./copyStatic");
const reader = require("./reader");
const makePosts = require("./makePosts");
const makeIndex = require("./makeIndex");

const dir = path.join(__dirname, "../sources");
const outputRoot = path.join(__dirname, "../next");

const data = reader(dir);

makeIndex(data, outputRoot);
copyStatic(data, outputRoot);
makePosts(data, outputRoot);
