import { withErrorHandler } from "@/helpers/ApiHandler";
import DateFormater from "@/helpers/DateFormater";
import { Response } from "@/infra/responses";
import Coupons, {
  ICreateCoupon,
  ICreatedCoupon,
  ICreatedCoupons,
} from "@/models/coupons";
import { createCoupon } from "@/validators/coupon";
import date from "@/validators/date";
import { NextRequest, NextResponse } from "next/server";

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

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const initialDatetime = date.parse(
    searchParams.get("initialDate") ?? DateFormater.today(),
  );
  const finalDatetime = date.parse(
    searchParams.get("finalDate") ?? DateFormater.today(),
  );

  const coupons = new Coupons();
  const allCoupons = await coupons.getAllCoupons(
    initialDatetime,
    finalDatetime,
  );

  const responseBody = new Response<ICreatedCoupons>({
    error: false,
    status_code: 200,
    message: "",
    action: "",
    data: allCoupons,
  });

  return NextResponse.json(responseBody, { status: responseBody.status_code });
});
