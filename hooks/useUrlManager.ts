import ResponseFilter from "@/helpers/ResponseFilter";
import {
  ICreatedProduct,
  ICreatedProducts,
  ICreateProduct,
} from "@/models/products";
import {
  ICreatedProductRequest,
  ICreatedProductsRequest,
  IProductRequest,
  ScrapingStatus,
} from "@/models/scraper";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ICreateProductRequest } from "@/app/api/v1/scraper/request/route";
import {
  DiscountType,
  ICreateCoupon,
  ICreatedCoupon,
  ICreatedCoupons,
} from "@/models/coupons";

interface IProductsRequestCount {
  pending: number;
  done: number;
  failed: number;
  all: number;
  processing: number;
}

interface IProductsCount {
  pending: number;
  posted: number;
  failed: number;
  all: number;
}

function useUrlManager() {
  const [allProductsRequest, setAllProductsRequest] = useState<
    ICreatedProductsRequest | undefined
  >();
  const allProductsRequestRef = useRef<ICreatedProductsRequest | undefined>(
    undefined,
  );
  const isFindingItemsRef = useRef(false);
  const [productsRequestCount, setProductsRequestCount] =
    useState<IProductsRequestCount>({
      all: 0,
      done: 0,
      failed: 0,
      pending: 0,
      processing: 0,
    });
  const [pendingProductsRequest, setPendingProductsRequest] = useState<
    ICreatedProductsRequest | undefined
  >();
  const [processingProductsRequest, setProcessingProductsRequest] = useState<
    ICreatedProductsRequest | undefined
  >();
  const [doneProductsRequest, setDoneProductsRequest] = useState<
    ICreatedProductsRequest | undefined
  >();
  const [failedProductsRequest, setFailedProductsRequest] = useState<
    ICreatedProductsRequest | undefined
  >();

  const [allProducts, setAllProducts] = useState<
    ICreatedProducts | undefined
  >();

  const [productsCount, setProductsCount] = useState<IProductsCount>({
    all: 0,
    posted: 0,
    failed: 0,
    pending: 0,
  });
  const [pendingProducts, setPendingProducts] = useState<
    ICreatedProducts | undefined
  >();
  const [doneProducts, setDoneProducts] = useState<
    ICreatedProducts | undefined
  >();
  const [failedProducts, setFailedProducts] = useState<
    ICreatedProducts | undefined
  >();

  const [selectedProductsId, setSelectedProductsId] = useState<number[]>([]);

  const [couponName, setCouponName] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponDiscountType, setCouponDiscountType] =
    useState<DiscountType>("percentage");
  const [couponDiscountLimit, setCouponDiscountLimit] = useState("");
  const [couponMinPurchase, setCouponMinPurchase] = useState("");
  const [coupons, setCoupons] = useState<ICreatedCoupon[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<number[]>([]);

  useEffect(() => {
    function filterProductsByEachStatus() {
      const pending: ICreatedProducts = [];
      const posted: ICreatedProducts = [];
      const failed: ICreatedProducts = [];

      for (const product of allProducts ?? []) {
        switch (product.status) {
          case "pending":
            pending.push(product);
            break;
          case "posted":
            posted.push(product);
            break;
          case "failed":
            failed.push(product);
            break;
        }
      }

      setProductsCount({
        all: allProducts?.length ?? 0,
        posted: posted.length,
        failed: failed.length,
        pending: pending.length,
      });
      setPendingProducts(pending);
      setDoneProducts(posted);
      setFailedProducts(failed);
    }
    filterProductsByEachStatus();
  }, [allProducts]);

  useEffect(() => {
    allProductsRequestRef.current = allProductsRequest;
  }, [allProductsRequest]);

  useEffect(() => {
    function filterProductUrlByEachStatus() {
      const enqueued: IProductRequest[] = [];
      const processing: IProductRequest[] = [];
      const done: IProductRequest[] = [];
      const failed: IProductRequest[] = [];

      for (const product of allProductsRequest ?? []) {
        switch (product.status) {
          case "pending":
            enqueued.push(product);
            break;
          case "processing":
            processing.push(product);
            break;
          case "done":
            done.push(product);
            break;
          case "failed":
            failed.push(product);
            break;
        }
      }

      setProductsRequestCount({
        all: allProductsRequest?.length ?? 0,
        done: done?.length ?? 0,
        failed: failed?.length ?? 0,
        pending: enqueued?.length ?? 0,
        processing: processing?.length ?? 0,
      });

      setPendingProductsRequest(enqueued);
      setProcessingProductsRequest(processing);
      setDoneProductsRequest(done);
      setFailedProductsRequest(failed);
    }
    filterProductUrlByEachStatus();
  }, [allProductsRequest]);

  async function saveUrl(url: ICreateProductRequest) {
    if (!url.url.startsWith("https://")) {
      toast.error("The URL must starts with https://");
      return;
    }

    const response = await fetch("/api/v1/scraper/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.url, couponId: url.couponId }),
    });

    const responseBody = ResponseFilter.parse<ICreatedProductRequest>(
      await response.json(),
    );
    const data = responseBody?.data;
    if (data) setAllProductsRequest((prev) => [...(prev ?? []), data]);
  }

  async function saveCoupon(coupon: ICreateCoupon) {
    if (!coupon.name) {
      toast.error("Insert a coupon.");
      return;
    }

    if (!Number.isFinite(coupon.discount) || coupon.discount <= 0) {
      toast.error("Insert a valid discount.");
      return;
    }

    if (
      coupon.discount_limit != null &&
      (!Number.isFinite(coupon.discount_limit) || coupon.discount_limit <= 0)
    ) {
      toast.error("Insert a valid discount limit.");
      return;
    }

    if (
      coupon.min_purchase != null &&
      (!Number.isFinite(coupon.min_purchase) || coupon.min_purchase <= 0)
    ) {
      toast.error("Insert a valid minimum purchase.");
      return;
    }

    const response = await fetch("/api/v1/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });

    const createdCoupon = ResponseFilter.parse<ICreatedCoupon>(
      await response.json(),
    );
    if (createdCoupon && createdCoupon.data != undefined) {
      setCoupons((prev) => [...(prev ?? []), createdCoupon.data!]);
    }
  }

  const getAllUrls = useCallback(async (date: string) => {
    const response = await fetch(`/api/v1/scraper/status/all?date=${date}`);
    const responseBody = ResponseFilter.parse<ICreatedProductsRequest>(
      await response.json(),
    );
    const data = responseBody?.data;
    setAllProductsRequest(data ?? []);
  }, []);

  const getAllProducts = useCallback(async (date: string) => {
    const response = await fetch(`/api/v1/products?date=${date}`);
    const responseBody = ResponseFilter.parse<ICreatedProducts>(
      await response.json(),
    );
    const data = responseBody?.data;
    setAllProducts(data ?? []);
  }, []);

  const getAllCoupons = useCallback(async () => {
    const response = await fetch("/api/v1/coupons");
    const responseBody = ResponseFilter.parse<ICreatedCoupons>(
      await response.json(),
    );
    const data = responseBody?.data;
    setCoupons(data ?? []);
  }, []);

  function updateProductRequestStatus(id: number, status: ScrapingStatus) {
    setAllProductsRequest((prev) => {
      const updated = (prev ?? []).map((productRequest) =>
        productRequest.id === id
          ? { ...productRequest, status }
          : productRequest,
      );
      allProductsRequestRef.current = updated;
      return updated;
    });
  }

  async function startFindingItems() {
    if (isFindingItemsRef.current) return;

    if (
      !allProductsRequestRef.current?.some(
        (productRequest) => productRequest.status === "pending",
      )
    )
      return toast.error("First enqueue an URL.");

    isFindingItemsRef.current = true;

    try {
      let nextProductEnqueued = allProductsRequestRef.current?.find(
        (productRequest) => productRequest.status === "pending",
      );

      while (nextProductEnqueued) {
        const { id, url } = nextProductEnqueued;

        updateProductRequestStatus(id, "processing");

        const response = await fetch(
          `/api/v1/scraper/request?id=${id}&url=${url}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const responseBody = ResponseFilter.parse<ICreateProduct>(
          await response.json(),
        );

        if (!responseBody?.data) {
          updateProductRequestStatus(id, "failed");
        } else {
          const response2 = await fetch(`/api/v1/products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product_request_id: responseBody.data.product_request_id,
              name: responseBody.data.name,
              image_url: responseBody.data.image_url,
              current_price: responseBody.data.current_price,
              old_price: responseBody.data.old_price,
            }),
          });

          const responseBody2 = ResponseFilter.parse<ICreatedProduct>(
            await response2.json(),
          );

          if (responseBody2 !== null) updateProductRequestStatus(id, "done");
          else updateProductRequestStatus(id, "failed");

          if (responseBody2?.data) {
            const newProduct = responseBody2.data;
            setAllProducts((prev) => [...(prev ?? []), newProduct]);
          }
        }

        nextProductEnqueued = allProductsRequestRef.current?.find(
          (productRequest) => productRequest.status === "pending",
        );
      }
    } finally {
      isFindingItemsRef.current = false;
    }
  }

  return {
    allProductsRequest,
    productsRequestCount,
    pendingProductsRequest,
    processingProductsRequest,
    doneProductsRequest,
    failedProductsRequest,
    saveUrl,
    saveCoupon,
    getAllUrls,
    getAllProducts,
    getAllCoupons,
    startFindingItems,
    allProducts,
    productsCount,
    pendingProducts,
    doneProducts,
    failedProducts,
    selectedProductsId,
    setSelectedProductsId,
    couponName,
    setCouponName,
    couponDiscount,
    setCouponDiscount,
    couponDiscountType,
    setCouponDiscountType,
    couponDiscountLimit,
    setCouponDiscountLimit,
    couponMinPurchase,
    setCouponMinPurchase,
    coupons,
    setCoupons,
    selectedCoupons,
    setSelectedCoupons,
  };
}

export default useUrlManager;
