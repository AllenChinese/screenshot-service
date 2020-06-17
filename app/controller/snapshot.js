'use strict'

const Controller = require('egg').Controller
const puppeteer = require('puppeteer-cn')

class SnapshotController extends Controller {
  /**
   * 截图接口
   * @param {Object} ctx - 上下文
   * @return {Object} result - 图片信息返回
   */
  async postSnapshotJson(ctx) {
    ctx.status = 200
    ctx.body = {
      success: true,
      message: 'hi, egg',
      result: await this.handleSnapshot(),
    }
  }

  async handleSnapshot() {
    const { ctx } = this
    try {
      let result = null
      // 是否命中 redis 缓存
      // 重新生成截图
      result = this.createSnapshot()
      return result
    } catch (e) {
      ctx.status = 500
      return ctx.throw(500, e.message)
    }
  }

  /**
   * 生成截图
   */
  async createSnapshot() {
    console.time('time')
    const { ctx } = this
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let snapshotResult = null

    const referer = ctx.request.header.referer
    await page.goto(referer)

    // 截图生成二进制图像
    await page
      .screenshot({
        encoding: 'binary',
      })
      .then(async res => {
        snapshotResult = await ctx.service.imgBufferToUrl.imgBufferToUrl(res)
      })
    await browser.close()
    console.timeEnd('time')
    return snapshotResult
  }
}

module.exports = SnapshotController
