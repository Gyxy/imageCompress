# yh-image-compress

## 简介

yh-image-compress 是一个基于 [`@jsquash/avif` `@jsquash/jpeg` `@jsquash/jxl` `@jsquash/png` `@jsquash/webp`]((https://github.com/jamsinclair/jSquash)) 的图片压缩和格式转换库，支持 `png`、`jpg`、`jpeg`、`gif`、`webp` 等常见图片格式转换和图片压缩。

## 安装

```bash
npm install yh-image-compress 
# or
yarn add yh-image-compress
```

## 使用

```javascript
import { toCompressImage } from 'yh-image-compress'
// outType = 'avif' | 'jpeg' | 'jxl' | 'png' | 'webp' 默认为 '图片原始格式'
// quality = 75 图片质量，默认为 75
let result = await toCompressImage(file, outType,quality);
// 返回数据
// result = {
// blobUrl, // 返回的图片二进制url
// newFile, // 反馈新的图片文件对象
// }
```