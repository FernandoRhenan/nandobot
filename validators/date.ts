import { z } from "zod";

const date = z.iso
  .date("The date must be a valid date in the YYYY-MM-DD format.")
  .transform((value) => new Date(value));

export default date;
