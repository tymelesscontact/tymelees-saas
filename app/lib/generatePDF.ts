import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const executablePath = await chromium.executablePath()

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })

  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '30px',
      right: '30px',
      bottom: '30px',
      left: '30px',
    },
  })

  await browser.close()
  return Buffer.from(pdf)
}