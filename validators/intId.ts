import { z } from "zod";

const intId = z
  .number("The id must be an integer.")
  .int("The id must be an integer.")
  .positive("The id must be an integer.");

export default intId;
