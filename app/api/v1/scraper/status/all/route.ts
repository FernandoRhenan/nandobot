import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Scraper, { ICreatedProductsRequest } from "@/models/scraper";
import { NextRequest, NextResponse } from "next/server";
import date from "@/validators/date";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const datetime = date.parse(searchParams.get("date"));
  const scraper = new Scraper();
  const allProducts = await scraper.getAllProductsRequests(datetime);

  return NextResponse.json(
    new Response<ICreatedProductsRequest>({
      error: false,
      status_code: 200,
      message: "",
      action: "",
      data: allProducts,
    }),
  );
});
