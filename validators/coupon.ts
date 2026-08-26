import { z } from "zod";

export const createCoupon = z
  .object({
    name: z
      .string("The name must be a string.")
      .trim()
      .min(1, { message: "The name is required." })
      .max(96, { message: "The name must have at most 96 characters." }),

    discount: z
      .number("The discount must be a number.")
      .int("The discount must be an integer.")
      .positive("The discount must be a positive number."),

    discount_type: z.enum(
      ["percentage", "fixed"],
      "The discount type must be percentage or fixed.",
    ),

    discount_limit: z
      .number("The discount limit must be a number.")
      .int("The discount limit must be an integer.")
      .positive("The discount limit must be a positive number.")
      .nullable()
      .default(null),

    min_purchase: z
      .number("The minimum purchase must be a number.")
      .int("The minimum purchase must be an integer.")
      .positive("The minimum purchase must be a positive number.")
      .nullable()
      .default(null),
  })
  .refine(
    (coupon) => coupon.discount_type !== "percentage" || coupon.discount <= 100,
    {
      message: "The percentage discount must be at most 100.",
      path: ["discount"],
    },
  );
