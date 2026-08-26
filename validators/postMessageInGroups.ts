import { z } from "zod";
import intId from "@/validators/intId";

const postMessageInGroups = z.object({
  productsId: z
    .array(intId)
    .min(1, { message: "Send at least one product id." }),

  groupsId: z
    .array(z.string("Each group id must be a string.").trim().min(1))
    .min(1, { message: "Send at least one group id." }),

  interval: z
    .number("The interval must be a number.")
    .int("The interval must be an integer.")
    .positive("The interval must be a positive number."),
});

export default postMessageInGroups;
