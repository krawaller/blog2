import React from "react";
import Link from "next/link";

const headline = "krawaller"
  .split("")
  .map((letter, n) => <span key={n}>{letter}</span>);

const style = {
  // display: "flex",
  // justifyContent: "space-between",
  // textDecoration: "none",
  // color: "black",
  // fontWeight: 100,
  // fontFamily: '"Lexend Zetta", sans-serif'
};

export const Headline = () => (
  <h1>
    <Link href="/">
      <a style={style}>{headline}</a>
    </Link>
  </h1>
);
