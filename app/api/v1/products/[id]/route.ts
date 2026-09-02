import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Products, { ICreatedProduct } from "@/models/products";
import intId from "@/validators/intId";
import { NextRequest, NextResponse } from "next/server";

export const GET = withErrorHandler<{ id: string }>(
  async (request: NextRequest, { params }) => {
    const id = (await params).id;
    const validatedId = intId.parse(Number(id));

    const products = new Products();
    const product = await products.getProductById(validatedId);

    return NextResponse.json(
      new Response<ICreatedProduct>({
        error: false,
        status_code: 200,
        message: "",
        action: "",
        data: product,
      }),
    );
  },
);
