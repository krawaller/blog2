import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const Master = ({ title, summary, children, kind, data }) => {
  useEffect(() => {
    window.ga =
      window.ga ||
      function() {
        (ga.q = ga.q || []).push(arguments);
      };
    ga.l = +new Date();
    ga("create", "UA-11433118-1", "auto");
  }, []);
  useEffect(() => {
    if (kind === "post") {
      function loadComments() {
        if (window.DISQUS) {
          document
            .getElementById("disqus_thread")
            .setAttribute("style", "display: block;");
          window.DISQUS.reset({
            reload: true,
            config: function() {
              this.page.identifier = data.id;
              this.page.url = "https://blog.krawaller.se/posts/" + data.url;
              this.page.title = title;
              this.language = "en";
            }
          });
        } else {
          setTimeout(loadComments, 1000);
        }
      }
      loadComments();
    }
    return () =>
      document
        .getElementById("disqus_thread")
        .setAttribute("style", "display: none;");
  }, [kind, data]);
  useEffect(() => {
    window.onlocationchange;
  });
  return (
    <div className="master">
      <Head>
        <title>{title}</title>
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
    </div>
  );
};

export default Master;
