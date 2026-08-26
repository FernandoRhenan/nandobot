"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useUrlManager from "@/hooks/useUrlManager";
import Text from "@/components/Text";
import Title from "@/components/Title";
import TabSelector, { Tab } from "@/components/tabs/TabSelector";
import AllProductsTab from "@/components/tabs/AllProductsTab";
import QueuedProductsTab from "@/components/tabs/QueuedProductsTab";
import PostedProductsTab from "@/components/tabs/PostedProductTab";
import StatusDot from "@/components/StatusDot";
import useWhatsapp, { postSortingOptions } from "@/hooks/useWhatsapp";
import Button from "@/components/Button";
import QrCodeReader from "@/components/QrCodeReader";
import GroupSelector from "@/components/GroupSelector";
import PlayIcon from "@/components/icons/PlayIcon";
import IntervalSelect from "@/components/IntervalSelect";
import { ICreatedProduct } from "@/models/products";
import OffIcon from "@/components/icons/OffIcon";
import DateSelect from "@/components/DateSelect";
import DateFormater from "@/helpers/DateFormater";
import LineBorderEdge from "@/components/lineBorderEdge";
import RadioSelector from "@/components/radioSelector";

type ProductsTabs = "all" | "pending" | "done";

const whatsappStatusLabel = {
  open: "Conectado",
  connecting: "Conectando...",
  close: "Desconectado",
} as const;

const whatsappStatusFlag = {
  open: "connected",
  connecting: "connecting",
  close: "disconnected",
} as const;

export default function PublisherPage() {
  const urlManager = useUrlManager();
  const whatsappManager = useWhatsapp();

  const productsTabs: Tab<ProductsTabs>[] = [
    { key: "all", label: "Todos", count: urlManager.productsCount.all },
    {
      key: "pending",
      label: "Na fila",
      count: urlManager.productsCount.pending,
    },
    {
      key: "done",
      label: "Concluídos",
      count: urlManager.productsCount.posted,
    },
  ];

  const [selectedDate, setSelectedDate] = useState<string>(DateFormater.today);

  useEffect(() => {
    urlManager.getAllProducts(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlManager.getAllProducts, selectedDate]);

  const [currentScrapingTab, setCurrentScrapingTab] =
    useState<ProductsTabs>("all");

  const [scheduleIntervalMinutes, setScheduleIntervalMinutes] =
    useState<number>(5);

  function handleSelect(item: ICreatedProduct) {
    const isSelected = urlManager.selectedProductsId.includes(item.id);
    const copy = isSelected
      ? urlManager.selectedProductsId.filter((id) => id !== item.id)
      : [...urlManager.selectedProductsId, item.id];

    urlManager.setSelectedProductsId(copy);
  }

  return (
    <main className={styles.main}>
      <div className={styles.panelContainer}>
        <div className={styles.panelArea}>
          <div className={styles.panelHeader}>
            <Title size={18} bold type="h1">
              Meus produtos
            </Title>
            <Text color="muted">Publique os produtos no grupo.</Text>
            <div className={styles.panelProductSettings}>
              <div className={styles.dateArea}>
                <Text size={12} bold color="faint">
                  DATA DOS PRODUTOS
                </Text>
                <DateSelect value={selectedDate} onChange={setSelectedDate} />
              </div>
            </div>
            <TabSelector
              tabs={productsTabs}
              active={currentScrapingTab}
              onChange={setCurrentScrapingTab}
            />
          </div>
          <div className={styles.panelContent}>
            {currentScrapingTab === "all" && (
              <AllProductsTab
                selectedProductsId={urlManager.selectedProductsId}
                allowSelection
                handleSelect={handleSelect}
                allProducts={urlManager.allProducts}
              />
            )}
            {currentScrapingTab === "pending" && (
              <QueuedProductsTab
                selectedProductsId={urlManager.selectedProductsId}
                allowSelection
                handleSelect={handleSelect}
                enqueuedProducts={urlManager.pendingProducts}
              />
            )}
            {currentScrapingTab === "done" && (
              <PostedProductsTab
                allowSelection={false}
                postedProducts={urlManager.doneProducts}
              />
            )}
          </div>
        </div>
      </div>
      <div className={styles.sideBarContainer}>
        <div className={styles.inputArea}>
          <div className={styles.whatsAppStatus}>
            <Button
              variant="green"
              height={30}
              width={30}
              icon={<PlayIcon />}
              disabled={whatsappManager.status === "close" ? false : true}
              onClick={() => whatsappManager.connect()}
            />
            <Button
              height={30}
              width={30}
              icon={<OffIcon />}
              variant="danger"
              disabled={whatsappManager.status === "close" ? true : false}
              onClick={() => whatsappManager.disconnect()}
            />
            <Text size={14} color="muted">
              Whatsapp status:
            </Text>
            <StatusDot flag={whatsappStatusFlag[whatsappManager.status]} />
            <Text size={12} color="faint">
              {whatsappStatusLabel[whatsappManager.status]}
            </Text>
          </div>
          <LineBorderEdge />
          {whatsappManager.qrCode && (
            <QrCodeReader value={whatsappManager.qrCode} />
          )}
          <div className={`${styles.whatsappSetup} ${styles.whatsAppGroups}`}>
            <Text size={12} bold color="faint">
              GRUPO DE DESTINO
            </Text>
            {whatsappManager.groups.length ? (
              <GroupSelector
                groups={whatsappManager.groups}
                selectedGroupIds={whatsappManager.selectedGroupIds}
                onChange={whatsappManager.setSelectedGroupIds}
              />
            ) : (
              <Text>Nenhum disponível.</Text>
            )}
          </div>
          <LineBorderEdge />
          <div className={styles.whatsappSetup}>
            <Text size={12} bold color="faint">
              AGENDAMENTO
            </Text>
            <Text size={12} color="muted">
              Intervalo entre as postagens:
            </Text>
            <IntervalSelect
              value={scheduleIntervalMinutes}
              onChange={setScheduleIntervalMinutes}
            />
          </div>
          <LineBorderEdge />
          <div className={styles.whatsappSetup}>
            <Text size={12} bold color="faint">
              ORDEM DOS POSTS
            </Text>
            <RadioSelector
              name="postSorting"
              options={postSortingOptions}
              value={whatsappManager.sort}
              onChange={whatsappManager.setSort}
              direction="column"
            />
          </div>
          <LineBorderEdge />
          <div className={styles.whatsappSetup}>
            <Text size={12} color="muted" bold>
              Número de posts selecionados:{" "}
              {urlManager.selectedProductsId.length}
            </Text>
            <Text size={12} color="muted" bold>
              Terminará em{" "}
              {urlManager.selectedProductsId.length > 1
                ? urlManager.selectedProductsId.length *
                    scheduleIntervalMinutes -
                  scheduleIntervalMinutes
                : 0}{" "}
              {" minutos."}
            </Text>
            <Button
              onClick={async () => {
                await whatsappManager.sendGroupMessages({
                  productsId: urlManager.selectedProductsId,
                  groupsId: whatsappManager.selectedGroupIds,
                  interval: scheduleIntervalMinutes,
                });
              }}
              disabled={
                urlManager.selectedProductsId.length > 0 &&
                whatsappManager.selectedGroupIds.length > 0
                  ? false
                  : true
              }
              label="Postar"
            />
          </div>
        </div>
        <div className={styles.pipelineArea}></div>
      </div>
    </main>
  );
}
