const process = require("../build/process");

function clean(str) {
  return str.replace(/^<p>|<\/p>\s*/g, "");
}

test("processing static markdown links", () => {
  const data = {
    posts: {
      myPost: {
        body: `Pic: ![](./static/foo.png)`,
        attributes: {
          url: "meep"
        }
      }
    }
  };
  const result = clean(process(data, "myPost"));
  expect(result).toBe('Pic: <img src="../static/meep/foo.png" alt="">');
});
