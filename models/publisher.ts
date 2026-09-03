import baileys from "@/infra/baileys";
import { type GroupMetadata } from "baileys";
import redis, { redisKeys } from "@/infra/redis";
import Products, { TCreatedProductAndUrl } from "@/models/products";
import PriceFormater from "@/helpers/PriceFormater";
import CouponFormater from "@/helpers/CouponFormater";

export default class Publisher {
  async getGroups(): Promise<GroupMetadata[]> {
    const whatsapp = await baileys.getConnectedSocket();

    const groups = await whatsapp.groupFetchAllParticipating();

    return Object.values(groups);
  }

  async postMessageInGroup(): Promise<void> {
    const redisConnection = await redis.startConnection();
    const groupKeys = await redisConnection.keys(`${redisKeys.WHATSAPP_POST}*`);

    if (groupKeys.length === 0) return;

    const minutes = new Date().getUTCMinutes();

    const products = new Products();

    for (const key of groupKeys) {
      const minutesOfPost = Number(key.split(":")[3]);
      const postIsAvailable = minutes % minutesOfPost === 0;

      if (!postIsAvailable) return;

      const stringifiedProduct = await redisConnection.lPop(key);

      if (!stringifiedProduct) return;

      const pendingProduct: IRedisWhatsappPendingProduct =
        JSON.parse(stringifiedProduct);

      const product = await products.getProductById(pendingProduct.productId);
      const groupId = key
        .replace(redisKeys.WHATSAPP_POST, "")
        .replace(`:${minutesOfPost}`, "");

      const caption = this.whatsappMessageFormater(product).join("\n");

      const whatsapp = await baileys.getConnectedSocket();

      await whatsapp.sendMessage(groupId, {
        image: { url: product.image_url },
        caption,
      });

      await products.changeProductsToPosted(product.id);
    }
  }

  async enqueueMessagesInGroups(ids: IPostMessageInGroups): Promise<void> {
    const redisConnection = await redis.startConnection();
    ids.groupsId.forEach(async (groupId) => {
      const stringifiedProductsIds: string[] = [];
      const keyName = `${redisKeys.WHATSAPP_POST}${groupId}:${ids.interval}`;

      ids.productsId.forEach((productId) => {
        const item: IRedisWhatsappPendingProduct = {
          productId: productId,
          groupId: ids.groupsId,
        };

        const stringifiedItem = JSON.stringify(item);
        stringifiedProductsIds.push(stringifiedItem);
      });
      await redisConnection.rPush(keyName, stringifiedProductsIds);
    });
  }

  private whatsappMessageFormater(product: TCreatedProductAndUrl): string[] {
    if (product.coupons && product.coupons.length > 0) {
      return this.couponMessage(product);
    } else {
      return this.normalMessage(product);
    }
  }

  private couponMessage(product: TCreatedProductAndUrl): string[] {
    const currentPrice = PriceFormater.formatNumberToString(
      CouponFormater.applyDiscount(product.current_price, product.coupons!),
    );

    const messageToPost = [
      `*${product.name}*`,
      "",
      "🤝🏼🟡 Mercado Livre",
      product.old_price
        ? `De ~${PriceFormater.formatNumberToString(product.old_price)}~`
        : "",
      `Por *${currentPrice}*`,
      "",
      `${CouponFormater.formatCoupons(product.coupons!)}`,
      "",
      "⚠️ A promoção pode acabar a qualquer momento!",
      "",
      "Veja os detalhes ⬇️",
      `Link: ${product.url}`,
    ];
    return messageToPost;
  }

  private normalMessage(product: TCreatedProductAndUrl): string[] {
    const messageToPost = [
      `*${product.name}*`,
      "",
      "🤝🏼🟡 Mercado Livre",
      product.old_price
        ? `De ~${PriceFormater.formatNumberToString(product.old_price)}~`
        : "",
      `Por *${PriceFormater.formatNumberToString(product.current_price)}*`,
      "",
      "⚠️ A promoção pode acabar a qualquer momento!",
      "",
      "Veja os detalhes ⬇️",
      `Link: ${product.url}`,
    ];
    return messageToPost;
  }
}

export interface IPostMessageInGroups {
  productsId: number[];
  groupsId: string[];
  interval: number;
}

export interface IRedisWhatsappPendingProduct {
  productId: number;
  groupId: string[];
}

export type IRedisWhatsappPendingProducts = IRedisWhatsappPendingProduct[];
