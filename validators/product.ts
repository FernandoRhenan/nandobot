import { z } from "zod";

export const createProduct = z.object({
  name: z.string("The name must be a string.").trim().min(1, {
    message: "The name is required.",
  }),

  image_url: z.url({
    message: "The image url must be a valid URL.",
    protocol: /^https/,
  }),

  current_price: z
    .number("The current price must be a number.")
    .gte(0, "The current price must be a positive number."),

  old_price: z
    .number("The old price must be a number.")
    .gte(0, "The old price must be a positive number."),

  product_request_id: z
    .number("Invalid input")
    .int("Invalid input")
    .positive("Invalid input"),
});
