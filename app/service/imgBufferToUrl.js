'use strict'

const Service = require('egg').Service
const qiniu = require('qiniu')
const stream = require('stream')
const Duplex = stream.Duplex || require('readable-stream').Duplex

class imgBufferToUrlService extends Service {
  async imgBufferToUrl(imgBuffer) {
    const result = {
      fileUrl: this.getFileOuterChainUrl(imgBuffer),
    }
    return result
  }

  /**
   * 获取图片外链地址
   *
   * @param {*} imgBuffer - 文件 buffer
   */
  getFileOuterChainUrl(imgBuffer) {
    // 保存图片默认域名
    const baseDomain = 'http://pyfdpht1a.bkt.clouddn.com/'

    // 需要填写你的 Access Key 和 Secret Key
    qiniu.conf.ACCESS_KEY = 'V6tZ3AkwGidM7l-ovlpyg1mQlkp9yKqjQl2mWJ34'
    qiniu.conf.SECRET_KEY = 'F7voGveG3VocGel15dcQfOQmhbua5KVW4Ig7XALh'

    // 要上传的空间
    const bucket = 'image-zhuojiawei'

    // 上传到七牛后保存的文件名
    const key = 'nodejs-logo-' + new Date().getTime() + '.png'

    // mac
    const mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY)

    // 构建上传策略函数
    function uptoken(bucket, mac) {
      const putPolicy = new qiniu.rs.PutPolicy({
        scope: bucket,
      })

      return putPolicy.uploadToken(mac)
    }

    // 生成上传 Token
    const token = uptoken(bucket, mac)

    // 要上传文件数据流
    const readStream = new Duplex()
    readStream.push(imgBuffer)
    readStream.push(null)

    // 调用uploadFile上传
    this.uploadFile(token, key, readStream)
    return baseDomain + key
  }

  /**
   *构造上传函数
   *
   * @param {string} uptoken - token 凭证
   * @param {string} key - 文件名
   * @param {*} readStream - 上传文件数据流
   * @memberof imgBufferToUrlService
   */
  uploadFile(uptoken, key, readStream) {
    const extra = new qiniu.form_up.PutExtra()
    const config = new qiniu.conf.Config()
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2
    const formUploader = new qiniu.form_up.FormUploader(config)
    try {
      formUploader.putStream(uptoken, key, readStream, extra, function(err, ret) {
        if (!err) {
          // 上传成功， 处理返回值
          console.log(ret.hash, ret.key, ret.persistentId)
        } else {
          // 上传失败， 处理返回代码
          console.log(err)
        }
      })
    } catch (err) {
      new Error(err.toString())
    }
  }
}

module.exports = imgBufferToUrlService
