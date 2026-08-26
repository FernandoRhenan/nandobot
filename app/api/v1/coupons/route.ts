import { withErrorHandler } from "@/helpers/ApiHandler";
import { Response } from "@/infra/responses";
import Coupons, {
  ICreateCoupon,
  ICreatedCoupon,
  ICreatedCoupons,
} from "@/models/coupons";
import { createCoupon } from "@/validators/coupon";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (request) => {
  const body: ICreateCoupon = await request.json();

  const couponValidated: ICreateCoupon = createCoupon.parse(body);

  const coupons = new Coupons();
  const createdCoupon = await coupons.createCoupon(couponValidated);

  const responseBody = new Response<ICreatedCoupon>({
    error: false,
    status_code: 201,
    message: "Coupon created.",
    action: "",
    data: createdCoupon,
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});

export const GET = withErrorHandler(async () => {
  const coupons = new Coupons();
  const allCoupons = await coupons.getAllCoupons();

  const responseBody = new Response<ICreatedCoupons>({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: allCoupons,
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
