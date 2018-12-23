const process = require("../process");

function clean(str) {
  return str.replace(/^<p>|<\/p>\s*/g, "");
}

function compare(str, expected) {
  const data = {
    posts: {
      myPost: {
        body: str,
        attributes: {}
      }
    }
  };
  const result = clean(process(data, "myPost"));
  expect(result).toBe(expected);
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
  expect(result).toBe('Pic: <img src="../static/posts/meep/foo.png" alt=""/>');
});

test("processing relative links", () => {
  compare(
    `Other post: [blaj](../other-post/)!`,
    'Other post: <Link href="/posts/other-post" prefetch><a>blaj</a></Link>!'
  );
});

test("closes images", () => {
  compare(`img: <img src="foo" bar="baz">`, 'img: <img src="foo" bar="baz"/>');
});

test("converts styles", () => {
  compare(
    `Foo.

<img style="margin-left: 2em;">
  
Bar`,
    `Foo.<img style={{"marginLeft":"2em"}}/>\n\n<p>Bar`
  );
});

test("converts to className", () => {
  compare(`<span class="xml">`, `<span className="xml">`);
});

test("iframe urls need index", () => {
  compare(`<iframe src="gnurp/foo">`, `<iframe src="gnurp/foo/index.html">`);
});

test("iframe urls should stay ok if already correct", () => {
  compare(`<iframe src="gnurp/foo.htm">`, `<iframe src="gnurp/foo.htm">`);
});

test("iframe urls with hashshould stay ok if already correct", () => {
  compare(
    `<iframe src="gnurp/foo.htm#poop">`,
    `<iframe src="gnurp/foo.htm#poop">`
  );
});

test("iframe urls need index.html before hash", () => {
  compare(
    `<iframe src="gnurp/foo#poop">`,
    `<iframe src="gnurp/foo/index.html#poop">`
  );
});

test("iframe urls need index.html before hash", () => {
  compare(
    `<iframe src="gnurp/foo#poop">`,
    `<iframe src="gnurp/foo/index.html#poop">`
  );
});

test("dont mix links", () => {
  compare(
    `gnurp [baz](http://foo.bar) bin [buh](../blaj) boh`,
    `gnurp <a href="http://foo.bar">baz</a> bin <Link href="/posts/blaj" prefetch><a>buh</a></Link> boh`
  );
});

test("inline js", () => {
  compare(
    `gnarp <script>flurp</script> gnorp`,
    `gnarp <script dangerouslySetInnerHTML={{__html: \`flurp\`}}/> gnorp`
  );
});

test("handles single quotes for class and style", () => {
  compare(
    `<button class='launchbutton' style='display:block'>Launch</button>`,
    `<button className="launchbutton" style={{"display":"block"}}>Launch</button>`
  );
});

test.only("dont mess up img literals", () => {
  compare(`<img foo="bar" />`, `<img foo="bar" />`);
});
