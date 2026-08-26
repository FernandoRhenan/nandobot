import { z } from "zod";

const productUrl = z
  .url({
    message: "The URL must be a valid link.",
    protocol: /^https/,
    hostname: /^meli\.la|link.amazon$/,
  })
  .trim();

export default productUrl;
