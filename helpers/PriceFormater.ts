export default class PriceFormater {
  static formatNumberToString(value: number): string {
    const [price1, price2 = ""] = `${value / 100}`.split(".");

    const formattedPrice = `R$ ${price1},${price2.padEnd(2, "0")}`;
    return formattedPrice;
  }
}
