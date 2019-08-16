const fs = require("fs-extra");
const path = require("path");

function makeRss(data, outputRoot) {
  console.log("Creating RSS");
  const today = new Date().toString().substr(0, 28);
  const file = `
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title><![CDATA[Krawaller weblog]]></title>
    <description><![CDATA[Krawaller weblog]]></description>
    <link>http://blog.krawaller.se</link>
    <generator>homebrewed code</generator>
    <lastBuildDate>${today}</lastBuildDate>
    <atom:link href="https://blog.krawaller.se/rss.xml" rel="self" type="application/rss+xml"/>
    <author><![CDATA[The Krawaller brothers]]></author>
    ${Object.keys(data.posts)
      .sort((k1, k2) => {
        return data.posts[k1].attributes.date < data.posts[k2].attributes.date
          ? 1
          : -1;
      })
      .slice(0, 20)
      .map((postId, n) => {
        const attrs = data.posts[postId].attributes;
        return `
          <item>
            <title><![CDATA[${attrs.title}]]></title>
            <description><![CDATA[${attrs.excerpt}]]></description>
            <link>https://blog.krawaller.se/posts/${attrs.url}</link>
            <guid isPermaLink="true">https://blog.krawaller.se/posts/${
              attrs.url
            }</guid>
            ${attrs.tags
              .map(t => `<category><![CDATA[${t}]]></category>`)
              .join("\n")}
            <dc:creator><![CDATA[${attrs.author[0].toUpperCase()}${attrs.author.substr(
          1
        )}]]></dc:creator>
            <pubDate>${new Date(attrs.date)
              .toString()
              .substr(0, 15)} 00:00:00 GMT</pubDate>
          </item>
          `;
      })
      .join("\n")}
  </channel>
</rss>`
    .replace(/\n/g, "")
    .replace(/> {2,}</g, "><");
  fs.writeFileSync(
    path.join(outputRoot, "rss.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n${file}`
  );
}

module.exports = makeRss;
