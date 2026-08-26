"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import InputText from "@/components/InputText";
import Button from "@/components/Button";
import Form from "@/components/Form";
import useUrlManager from "@/hooks/useUrlManager";
import Text from "@/components/Text";
import Title from "@/components/Title";
import TabSelector, { Tab } from "@/components/tabs/TabSelector";
import AllTab from "@/components/tabs/AllTab";
import QueuedTab from "@/components/tabs/QueuedTab";
import DoneTab from "@/components/tabs/DoneTab";
import FailedTab from "@/components/tabs/FailedTab";
import Link from "next/link";
import ProcessingTab from "@/components/tabs/ProcessingTab";
import AllProductsTab from "@/components/tabs/AllProductsTab";
import PostedProductsTab from "@/components/tabs/PostedProductTab";
import QueuedProductsTab from "@/components/tabs/QueuedProductsTab";
import DateSelect from "@/components/DateSelect";
import DateFormater from "@/helpers/DateFormater";
import DiscountTypeSelect from "@/components/DiscountTypeSelect";
import CouponList from "@/components/CouponList";

type ScrapingTabs = "all" | "pending" | "done" | "failed" | "processing";
type PostTabs = "all" | "pending" | "posted" | "failed";

export default function ScraperPage() {
  const urlManager = useUrlManager();

  const scrapingTabs: Tab<ScrapingTabs>[] = [
    { key: "all", label: "Todos", count: urlManager.productsRequestCount.all },
    {
      key: "pending",
      label: "Na fila",
      count: urlManager.productsRequestCount.pending,
    },
    {
      key: "processing",
      label: "Processando",
      count: urlManager.productsRequestCount.processing,
    },
    {
      key: "done",
      label: "Concluídos",
      count: urlManager.productsRequestCount.done,
    },
    {
      key: "failed",
      label: "Falhas",
      count: urlManager.productsRequestCount.failed,
    },
  ];

  const postTabs: Tab<PostTabs>[] = [
    { key: "all", label: "Todos", count: urlManager.productsCount.all },
    {
      key: "pending",
      label: "Na fila",
      count: urlManager.productsCount.pending,
    },
    {
      key: "posted",
      label: "Postados",
      count: urlManager.productsCount.posted,
    },
  ];

  const [selectedProductsDate, setSelectedProductsDate] = useState<string>(
    DateFormater.today,
  );
  const [selectedRequestProductsDate, setSelectedRequestProductsDate] =
    useState<string>(DateFormater.today);

  useEffect(() => {
    urlManager.getAllUrls(selectedRequestProductsDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlManager.getAllUrls, selectedRequestProductsDate]);

  useEffect(() => {
    urlManager.getAllProducts(selectedProductsDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlManager.getAllProducts, selectedProductsDate]);

  useEffect(() => {
    urlManager.getAllCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlManager.getAllCoupons]);

  const [currentScrapingTab, setCurrentScrapingTab] =
    useState<ScrapingTabs>("all");
  const [currentPostTab, setCurrentPostTab] = useState<PostTabs>("all");

  const [inputValue, setInputValue] = useState("");

  return (
    <main className={styles.main}>
      <div className={styles.sideBarContainer}>
        <div className={styles.inputArea}>
          <Text bold>Adicionar link:</Text>
          <Text color="muted">Um link por vez. Entra na fila do scraper.</Text>
          <div className={styles.inputBox}>
            <Form
              onSubmit={async () => {
                await urlManager.saveUrl({
                  url: inputValue,
                  couponId:
                    urlManager.selectedCoupons.length > 0
                      ? urlManager.selectedCoupons
                      : null,
                });
                setInputValue("");
                urlManager.setSelectedCoupons([]);
              }}
            >
              <InputText
                placeholder="https:&#47;&#47;  ..."
                value={inputValue}
                onChange={setInputValue}
              />
              <Button
                type="submit"
                label="Adicionar à fila"
                disabled={inputValue === "" ? true : false}
              />
            </Form>
          </div>
        </div>
        <div className={styles.couponsArea}>
          <Text size={12} bold color="faint">
            CUPONS
          </Text>
          <CouponList
            coupons={urlManager.coupons}
            selectedCouponsId={urlManager.selectedCoupons}
            onSelect={urlManager.setSelectedCoupons}
          />
        </div>
        <div className={styles.inputArea}>
          <Text bold>Adicionar cupom:</Text>
          <Text color="muted">Um cupom por vez.</Text>
          <div className={styles.inputBox}>
            <Form
              onSubmit={async () => {
                await urlManager.saveCoupon({
                  name: urlManager.couponName,
                  discount: Number(urlManager.couponDiscount),
                  discount_type: urlManager.couponDiscountType,
                  discount_limit:
                    urlManager.couponDiscountLimit === ""
                      ? null
                      : Number(urlManager.couponDiscountLimit),
                  min_purchase:
                    urlManager.couponMinPurchase === ""
                      ? null
                      : Number(urlManager.couponMinPurchase),
                });
                urlManager.setCouponName("");
                urlManager.setCouponDiscount("");
                urlManager.setCouponDiscountType("percentage");
                urlManager.setCouponDiscountLimit("");
                urlManager.setCouponMinPurchase("");
              }}
            >
              <InputText
                placeholder="Nome do cupom"
                value={urlManager.couponName}
                onChange={urlManager.setCouponName}
              />
              <DiscountTypeSelect
                value={urlManager.couponDiscountType}
                onChange={urlManager.setCouponDiscountType}
              />
              <InputText
                type="number"
                placeholder="Desconto do cupom"
                value={urlManager.couponDiscount}
                onChange={urlManager.setCouponDiscount}
              />
              <InputText
                type="number"
                placeholder="Limite de desconto (R$)"
                value={urlManager.couponDiscountLimit}
                onChange={urlManager.setCouponDiscountLimit}
              />
              <InputText
                type="number"
                placeholder="Compra mínima (R$)"
                value={urlManager.couponMinPurchase}
                onChange={urlManager.setCouponMinPurchase}
              />
              <Button
                type="submit"
                label="Adicionar"
                disabled={
                  urlManager.couponName === "" ||
                  urlManager.couponDiscount === ""
                }
              />
            </Form>
          </div>
        </div>
        <div className={styles.pipelineArea}>
          <Text size={12} bold color="faint">
            PIPELINE
          </Text>
          <Text>Próximo item da fila:</Text>

          {urlManager.pendingProductsRequest === undefined ||
            (urlManager.pendingProductsRequest[0] === undefined ? (
              <Text color="muted">Any items enqueued</Text>
            ) : (
              <Link
                className={styles.link}
                href={urlManager.pendingProductsRequest[0].url}
              >
                {urlManager.pendingProductsRequest[0].url}
              </Link>
            ))}

          <Button
            disabled={false}
            type="button"
            label="Iniciar pipeline"
            onClick={() => {
              urlManager.startFindingItems();
            }}
          />
        </div>
      </div>
      <div className={styles.panelContainer}>
        <div className={styles.panelArea1}>
          <div className={styles.panelHeader}>
            <Title size={18} bold type="h1">
              Fila de scraping
            </Title>
            <Text color="muted">Acompanhe o status dos seus links.</Text>
            <div className={styles.dateArea}>
              <Text size={12} bold color="faint">
                DATA DOS PRODUTOS
              </Text>
              <DateSelect
                value={selectedRequestProductsDate}
                onChange={setSelectedRequestProductsDate}
              />
            </div>
            <TabSelector
              tabs={scrapingTabs}
              active={currentScrapingTab}
              onChange={setCurrentScrapingTab}
            />
          </div>
          <div className={styles.panelContent}>
            {currentScrapingTab === "all" && (
              <AllTab
                allowSelection={false}
                allProductsRequest={urlManager.allProductsRequest}
              />
            )}
            {currentScrapingTab === "pending" && (
              <QueuedTab
                allowSelection={false}
                enqueuedProducts={urlManager.pendingProductsRequest}
              />
            )}
            {currentScrapingTab === "processing" && (
              <ProcessingTab
                allowSelection={false}
                processingProductsRequest={urlManager.processingProductsRequest}
              />
            )}
            {currentScrapingTab === "done" && (
              <DoneTab
                allowSelection={false}
                doneProductsRequest={urlManager.doneProductsRequest}
              />
            )}
            {currentScrapingTab === "failed" && (
              <FailedTab
                allowSelection={false}
                failedProductsRequest={urlManager.failedProductsRequest}
              />
            )}
          </div>
        </div>
        <div className={styles.panelArea2}>
          <div className={styles.panelHeader}>
            <Title size={18} bold type="h1">
              Produtos concluídos
            </Title>
            <Text color="muted">Gerencie os produtos.</Text>
            <div className={styles.dateArea}>
              <Text size={12} bold color="faint">
                DATA DOS PRODUTOS
              </Text>
              <DateSelect
                value={selectedProductsDate}
                onChange={setSelectedProductsDate}
              />
            </div>
            <TabSelector
              tabs={postTabs}
              active={currentPostTab}
              onChange={setCurrentPostTab}
            />
          </div>
          <div className={styles.panelContent}>
            {currentPostTab === "all" && (
              <AllProductsTab allProducts={urlManager.allProducts} />
            )}
            {currentPostTab === "pending" && (
              <QueuedProductsTab
                enqueuedProducts={urlManager.pendingProducts}
              />
            )}
            {currentPostTab === "posted" && (
              <PostedProductsTab postedProducts={urlManager.doneProducts} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
