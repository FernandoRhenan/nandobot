import { z } from "zod";
import productUrl from "./productUrl";

const productRequest = z.object({
  url: productUrl,
  couponId: z
    .array(z.number({ message: "The couponId must be valid." }))
    .nullable(),
});

export default productRequest;
