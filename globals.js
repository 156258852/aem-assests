import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * 创建模块级别的全局变量
 * @param {string} metaUrl - import.meta.url 的值
 * @returns {Object} 包含 __dirname 和 __filename 的对象
 */
export const createGlobals = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  
  return {
    __filename,
    __dirname
  };
};

/**
 * 获取当前文件的目录路径
 * @param {string} metaUrl - import.meta.url 的值
 * @returns {string} 当前文件的目录路径
 */
export const getCurrentDir = (metaUrl) => dirname(fileURLToPath(metaUrl));

/**
 * 获取当前文件的完整路径
 * @param {string} metaUrl - import.meta.url 的值
 * @returns {string} 当前文件的完整路径
 */
export const getCurrentFile = (metaUrl) => fileURLToPath(metaUrl);