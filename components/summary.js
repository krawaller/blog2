import React, { Fragment } from "react";
import Link from "next/link";

export const Summary = props => (
  <Fragment>
    <hr />
    <div className="summary">{props.summary}</div>
    <hr />
  </Fragment>
);
