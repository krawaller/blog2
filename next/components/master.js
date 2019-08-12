import React from "react";
import Head from "next/head";
import Link from "next/link";

const Master = ({ title, summary, children }) => (
  <div className="master">
    <Head>
      <title>{title}</title>
      <link rel="stylesheet" href="/static/styles/code.css" />
      <link rel="stylesheet" href="/static/styles/master.css" />
      {/* <script
        type="text/javascript"
        async
        src="//krawaller.disqus.com/embed.js"
      /> */}
    </Head>
    <h1>
      <Link href="/">
        <a>Krawaller</a>
      </Link>
    </h1>
    <hr />
    <div className="summary">{summary}</div>
    <hr />
    <h2>{title}</h2>
    <div className="page-content">{children}</div>
    {/* <hr />
    <div id="disqus_thread" />
    <a href="http://disqus.com" className="dsq-brlink">
      comments powered by <span className="logo-disqus">Disqus</span>
    </a> */}
  </div>
);

export default Master;
