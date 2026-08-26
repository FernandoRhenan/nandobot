import asyncio
import sys
import json
from random import randint
from playwright.async_api import async_playwright
from seleniumbase import cdp_driver

async def main():
    driver = await cdp_driver.start_async()
    endpoint_url = driver.get_endpoint_url()
    
    site_url = sys.argv[1]

    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(endpoint_url)
        page = browser.contexts[0].pages[0]
        await page.goto(site_url)
        await page.wait_for_load_state('domcontentloaded')
        base = page.locator(".rl-list-single").first
        titleElement = base.locator(".poly-component__title").first
        imageUrlElement = base.locator(".poly-component__picture").first

        priceElement = base.locator(".andes-money-amount--cents-superscript")
        oldPriceElement = base.locator(".andes-money-amount--previous")

        oldPrice = 0
        currentPrice = to_number(await priceElement.first.text_content())
        if(await oldPriceElement.count() > 0):
          oldPrice = to_number(await oldPriceElement.first.text_content())
                    
        titleText = await titleElement.text_content()
        imageTextUrl = await imageUrlElement.get_attribute("src")
        
        await browser.close()
        
        data = {
            "name": titleText,
            "current_price": currentPrice,
            "old_price": oldPrice,
            "image_url": imageTextUrl
        }

        json_string = json.dumps(data, ensure_ascii=False)
        print(json_string)

def to_number(price_text: str):
    specialCharsRemoved = price_text.replace("R$", "").replace(".", "")
    prices = specialCharsRemoved.split(',', 1)

    integerPart = prices[0]
    fractionPart = prices[1] if len(prices) > 1 else ''

    wholeValue = 0
    if(fractionPart != ''):
      wholeValue = int(integerPart + fractionPart)
    else:
      wholeValue = int(integerPart) * 100

    return wholeValue


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(main())
