import database from "@/infra/database";
import { ICreateProductRequest } from "@/app/api/v1/scraper/request/route";
import { resolve } from "path";
import util from "node:util";
import { execFile } from "child_process";
import { createProduct } from "@/validators/product";
import { ServiceError } from "@/infra/error";
import { ICreateProduct } from "./products";
import DateFormater from "@/helpers/DateFormater";

// O script tenta a página até 3 vezes com backoff quando a Amazon devolve
// captcha, e ainda pode esperar outra execução liberar o perfil do Chrome.
const SCRAPER_TIMEOUT_MS = 5 * 60 * 1000;

export default class Scraper implements IScraper {
  async findProductData(
    productUrl: string,
    id: number,
    store: string,
  ): Promise<ICreateProduct> {
    const fileScript =
      store === "meli"
        ? "get_meli_product_data.py"
        : "get_amazon_product_data.py";

    let command = resolve(".venv", "bin", "python");
    let args = [resolve("scrapers", fileScript), productUrl];

    if (process.env.NODE_ENV === "production") {
      command = "/app/.venv/bin/python3";
      args = [`/app/scrapers/${fileScript}`, productUrl];
    }

    const execFileAsync = util.promisify(execFile);

    let stdout: string;
    try {
      // O script escreve só o JSON no stdout; logs, avisos do SeleniumBase e a
      // causa real da falha (captcha, seletor quebrado) vão para o stderr.
      const result = await execFileAsync(command, args, {
        timeout: SCRAPER_TIMEOUT_MS,
      });
      stdout = result.stdout;
    } catch (error) {
      await this.changeProductRequestStatusToFailed(id);
      const stderr = (error as { stderr?: string }).stderr?.trim();
      throw new ServiceError({
        cause: error,
        message: stderr
          ? `Error to find the product: ${stderr}`
          : "Error to find the product.",
      });
    }

    const result = JSON.parse(stdout) as ICreateProduct;

    const product: ICreateProduct = {
      name: result.name,
      current_price: result.current_price,
      old_price: result.old_price,
      image_url: result.image_url,
      product_request_id: id,
    };

    const productValidated = createProduct.parse(product);

    return productValidated;
  }

  async createProductRequest(
    product: ICreateProductRequest,
  ): Promise<ICreatedProductRequest> {
    const command = await database.query({
      text: `
        INSERT INTO
          product_requests (url)
        VALUES
          ($1)
        RETURNING
          *
        ;
      `,
      values: [product.url],
    });

    const productRequestCreated = command.rows[0] as ICreatedProductRequest;

    return productRequestCreated;
  }

  async getAllProductsRequests(
    datetime: Date,
  ): Promise<ICreatedProductsRequest> {
    const date = DateFormater.onlyDate(datetime);

    const command = await database.query({
      text: `
        SELECT
          *
        FROM
          product_requests
        WHERE
          DATE(created_at) = $1
        ;
      `,
      values: [date],
    });

    return command.rows as ICreatedProductsRequest;
  }

  async changeProductStatusToProcessing(id: number) {
    await database.query({
      text: `
        UPDATE
          product_requests
        SET
          status = 'processing',
          updated_at = NOW()
        WHERE
          id = $1
        ;
      `,
      values: [id],
    });
  }

  async changeProductRequestStatusToFailed(id: number) {
    await database.query({
      text: `
        UPDATE
          product_requests
        SET
          status = 'failed',
        updated_at = NOW()
          WHERE
        id = $1
        ;
      `,
      values: [id],
    });
  }

  async changeProductRequestStatusToDone(id: number) {
    await database.query({
      text: `
          UPDATE
            product_requests
          SET
            status = 'done',
            updated_at = NOW()
            WHERE
          id = $1
          ;
        `,
      values: [id],
    });
  }
}

export interface IScraper {
  findProductData(
    productUrl: string,
    id: number,
    store: string,
  ): Promise<ICreateProduct>;

  createProductRequest(
    product: ICreateProductRequest,
  ): Promise<IProductRequest>;

  getAllProductsRequests(datetime: Date): Promise<ICreatedProductsRequest>;

  changeProductRequestStatusToFailed(id: number): Promise<void>;

  changeProductRequestStatusToDone(id: number): Promise<void>;
}

export interface IProductRequest {
  id: number;
  url: string;
  status: ScrapingStatus;
  created_at: Date;
  updated_at: Date;
}

export type ICreatedProductsRequest = IProductRequest[];
export type ICreatedProductRequest = IProductRequest;

export type ScrapingStatus = "pending" | "done" | "failed" | "processing";
