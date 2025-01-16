import * as avif from '@jsquash/avif';
import * as jpeg from '@jsquash/jpeg';
import * as jxl from '@jsquash/jxl';
import * as png from '@jsquash/png';
import * as webp from '@jsquash/webp';
// 用于跟踪每种格式是否已经加载了WASM
const wasmInitialized = new Map(); 
// 检测wasm是否已经加载完成
export async function ensureWasmLoaded(format){
  if (wasmInitialized.get(format)) return;
  try {
    switch (format) {
      case 'avif':
        await import('@jsquash/avif');
        break;
      case 'jpeg':
        await import('@jsquash/jpeg');
        break;
      case 'jxl':
        await import('@jsquash/jxl');
        break;
      case 'png':
        await import('@jsquash/png');
        break;
      case 'webp':
        await import('@jsquash/webp');
        break;
    }
    wasmInitialized.set(format, true);
  } catch (error) {
    console.error(`Failed to initialize WASM for ${format}:`, error);
    throw new Error(`Failed to initialize ${format} support`);
  }
}
// 解码
export async function decode(sourceType, fileBuffer){
  // 检测wasm 是否已经加载完毕
  await ensureWasmLoaded(sourceType);
  try {
    switch (sourceType) {
      case 'avif':
        return await avif.decode(fileBuffer);
      case 'jpeg':
      case 'jpg':
        return await jpeg.decode(fileBuffer);
      case 'jxl':
        return await jxl.decode(fileBuffer);
      case 'png':
        return await png.decode(fileBuffer);
      case 'webp':
        return await webp.decode(fileBuffer);
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
  } catch (error) {
    console.error(`Failed to decode ${sourceType} image:`, error);
    return false;
  }
}
// 封装
export async function encode(outputType, imageData, options){
  // 检测wasm 是否已经加载完毕
  await ensureWasmLoaded(outputType);

  try {
    switch (outputType) {
      case 'avif': {
        const avifOptions = {
          quality: options.quality,
          effort: 4 // Medium encoding effort
        };
        return await avif.encode(imageData, avifOptions);
      }
      case 'jpeg': {
        const jpegOptions = {
          quality: options.quality
        };
        return await jpeg.encode(imageData, jpegOptions);
      }
      case 'jxl': {
        const jxlOptions = {
          quality: options.quality
        };
        return await jxl.encode(imageData, jxlOptions);
      }
      case 'png':
        return await png.encode(imageData);
      case 'webp': {
        const webpOptions = {
          quality: options.quality
        };
        return await webp.encode(imageData, webpOptions);
      }
      default:
        console.log("不支持的输出类型");
        return false;
    }
  } catch (error) {
    console.error(`Failed to encode to ${outputType}:`, error);
    return false;
  }
}
// 获取文件类型
export function getFileType(file) {
  if (file.name.toLowerCase().endsWith('jxl')) return 'jxl';
  const type = file.type.split('/')[1];
  return type === 'jpeg' ? 'jpg' : type;
}
// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
// 压缩文件
export async function toCompressImage(file, outType, quality=75){
  try{
    // 获取文件buffer
    const fileBuffer = await file.arrayBuffer();
    // 获取文件类型
    const sourceType = getFileType(file)
    // 如果未传递输出类型，则默认为源文件类型
    if(!outType) outType = sourceType;
    // 解码文件数据
    const imageData = await decode(sourceType, fileBuffer);
    // 如果解码失败，则返回
    if (!imageData || !imageData.width || !imageData.height){
      console.log('错误的图片信息');
      return false;
    } 
    // 压缩图片质量
    let options = {quality}

    if(outType=='jpeg' || outType=='jpg'){
      outType = 'jpeg'
    }
    // 开始压缩图片
    const compressedBuffer = await encode(outType, imageData, options);
    // 如果压缩失败，则返回
    if (!compressedBuffer || !compressedBuffer.byteLength){
      console.log('压缩图片失败');
      return false;
    }
    // 创建blob文件对象
    const blob = new Blob([compressedBuffer], { type: `image/${outType}` });
    let newFileName = `${guid()}.${outType}`;
    // 重新封装为file对象
    const newFile = new File([blob], newFileName, { type: blob.type });
    // 展示图片信息
    const blobUrl = URL.createObjectURL(blob);
    // 返回数据信息
    return {newFile,blobUrl}
  }catch(err){
    console.log(err)
    return false;
  }
}

// 获取uuid
function guid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}



