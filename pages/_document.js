import Document, { Head, Main, NextScript } from "next/document";

const gaScript = `
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-11433118-1', 'auto');
  ga("send", "pageview");`;

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <html>
        <Head>
          <link
            rel="stylesheet"
            type="text/css"
            href="/static/styles/nprogress.css"
          />
          <link rel="stylesheet" href="/static/styles/code.css" />
          <link rel="stylesheet" href="/static/styles/site.css" />
          <script async src="https://www.google-analytics.com/analytics.js" />
          <script dangerouslySetInnerHTML={{ __html: gaScript }} />
        </Head>
        <body>
          <div className="site">
            <Main />
            <NextScript />
            <div id="disqus_thread" style={{ display: "none" }} />
          </div>
          <script
            key="disqus"
            type="text/javascript"
            async
            src="https://krawaller.disqus.com/embed.js"
          />
        </body>
      </html>
    );
  }
}
