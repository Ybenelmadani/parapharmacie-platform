import React from "react";
import { formatMoney } from "../../utils/currency";

export default function Price({ value }) {
  return <span className="font-semibold">{formatMoney(value)}</span>;
}
