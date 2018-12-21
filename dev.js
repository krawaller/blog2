const path = require("path");
const reader = require("./reader");
const process = require("./process");

const dir = path.join(__dirname, "../sources");

const data = reader(dir);

console.log(process(data, "hpjsreview"));
