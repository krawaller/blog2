import React from "react";
import Head from "next/head";
import Link from "next/link";

const Master = ({ title, summary, children }) => (
  <React.Fragment>
    <Head>
      <title>{title}</title>
      <link rel="stylesheet" href="/static/styles/code.css" />
    </Head>
    <h1>
      <Link href="/">
        <a>Krawaller</a>
      </Link>
    </h1>
    <hr />
    <div className="summary">{summary}</div>
    <hr />
    <div className="page-content">{children}</div>
  </React.Fragment>
);

export default Master;
