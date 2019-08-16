import React, { Fragment } from "react";
import Link from "next/link";

export const Headline = props => (
  <Fragment>
    <hr />
    <div className="summary">{summary}</div>
    <hr />
  </Fragment>
);
