import React from "react";
import App, { Container } from "next/app";
import NProgress from "nprogress";
import Router from "next/router";

Router.events.on("routeChangeStart", url => {
  console.log(`Loading: ${url}`);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default class MyApp extends App {
  render() {
    if (typeof window !== "undefined") {
      window.ga("send", "pageview");
    }
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <div style={{ marginBottom: 20 }} />

        <Component {...pageProps} />
      </Container>
    );
  }
}
