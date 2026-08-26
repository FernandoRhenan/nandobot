import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Coupons from "@/models/coupons";
import { ICreateProduct } from "@/models/products";
import Scraper, { ICreatedProductRequest } from "@/models/scraper";
import intId from "@/validators/intId";
import productRequest from "@/validators/productRequest";
import productUrl from "@/validators/productUrl";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (request) => {
  const body: ICreateProductRequest = await request.json();

  const productRequestValidated: ICreateProductRequest = productRequest.parse({
    url: body.url,
    couponId: body.couponId,
  });

  const scraper = new Scraper();
  const productRequestCreated = await scraper.createProductRequest(
    productRequestValidated,
  );

  if (productRequestValidated.couponId) {
    const coupons = new Coupons();
    const uniqueCouponsId = [...new Set(productRequestValidated.couponId)];
    await Promise.all(
      uniqueCouponsId.map((id) =>
        coupons.attachCouponToProduct(productRequestCreated.id, id),
      ),
    );
  }

  return NextResponse.json(
    new Response<ICreatedProductRequest>({
      error: false,
      status_code: 201,
      message: "URL enqueued.",
      action: "You can start pipeline to find it.",
      data: productRequestCreated,
    }),
  );
});

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const idValidated = intId.parse(Number(searchParams.get("id")));
  const urlValidated = productUrl.parse(searchParams.get("url"));

  let store = "";
  if (urlValidated.includes("amazon")) store = "amazon";
  if (urlValidated.includes("meli")) store = "meli";

  const scraper = new Scraper();
  const foundProduct = await scraper.findProductData(
    urlValidated,
    idValidated,
    store,
  );

  const responseBody = new Response<ICreateProduct>({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: foundProduct,
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});

export interface ICreateProductRequest {
  url: string;
  couponId: number[] | null;
}
