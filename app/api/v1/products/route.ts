import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Products, {
  ICreatedProduct,
  ICreatedProducts,
  ICreateProduct,
} from "@/models/products";
import Scraper from "@/models/scraper";
import date from "@/validators/date";
import { createProduct } from "@/validators/product";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const datetime = date.parse(searchParams.get("date"));

  const products = new Products();
  const allProducts = await products.getAllProducts(datetime);
  return NextResponse.json(
    new Response<ICreatedProducts>({
      error: false,
      status_code: 200,
      message: "",
      action: "",
      data: allProducts,
    }),
  );
});

export const POST = withErrorHandler(async (request) => {
  const body: ICreateProduct = await request.json();

  const validatedProduct = createProduct.parse(body);

  const products = new Products();
  const createdProduct = await products.createProduct(validatedProduct);

  const scraper = new Scraper();
  await scraper.changeProductRequestStatusToDone(
    validatedProduct.product_request_id,
  );

  const responseBody = new Response<ICreatedProduct>({
    error: false,
    status_code: 201,
    message: "",
    action: "",
    data: createdProduct,
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
