const process = require("../process");

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
  expect(result).toBe('Pic: <img src="../static/posts/meep/foo.png" alt=""/>');
});

test("processing relative links", () => {
  const data = {
    postsByUrl: {
      "other-post": "otherPostId"
    },
    posts: {
      myPost: {
        body: `Other post: [blaj](../other-post/)!`,
        attributes: {}
      }
    }
  };
  const result = clean(process(data, "myPost"));
  expect(result).toBe(
    'Other post: <Link href="/posts/other-post" prefetch><a>blaj</a></Link>!'
  );
});

test("closes images", () => {
  const data = {
    postsByUrl: {
      "other-post": "otherPostId"
    },
    posts: {
      myPost: {
        body: `img: <img src="foo" bar="baz">`,
        attributes: {}
      }
    }
  };
  const result = clean(process(data, "myPost"));
  expect(result).toBe('img: <img src="foo" bar="baz"/>');
});

test("converts styles", () => {
  const data = {
    postsByUrl: {
      "other-post": "otherPostId"
    },
    posts: {
      myPost: {
        body: `Foo.

<img style="margin-left: 2em;">

Bar`,
        attributes: {}
      }
    }
  };
  const result = clean(process(data, "myPost"));
  expect(result).toBe(`Foo.<img style={{"marginLeft":"2em"}}/>\n\n<p>Bar`);
});
