const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * 标准化filter配置项为统一格式
 * @param {string|Array} filterItem - filter数组中的单个元素
 * @returns {Array} 标准化后的数组格式 [path, options]
 */
function normalizeFilterItem(filterItem) {
  // 如果已经是数组格式，直接返回
  if (Array.isArray(filterItem)) {
    return filterItem;
  }
  
  // 如果是字符串格式，转换为数组格式 [path, options]
  return [filterItem, {}];
}

/**
 * 解析filter路径，支持标签和纯路径格式
 * @param {string} path - 路径字符串（可能是标签或纯路径）
 * @returns {string} 解析后的路径
 */
function parsePath(path) {
  // 如果是标签格式，如 <filter root="/apps/my-project"/>
  if (typeof path === 'string' && path.startsWith('<filter')) {
    // 提取root属性的值，支持单引号和双引号
    const match = path.match(/root\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      return match[1];
    }
  }
  // 如果是纯路径格式，直接返回
  return typeof path === 'string' ? path : '';
}

/**
 * 解析filter配置项
 * @param {string|Array} filterItem - filter数组中的单个元素
 * @returns {Object} 解析后的路径和操作类型 {path: string, type: string}
 */
function parseFilterItem(filterItem) {
  // 标准化为数组格式
  const [path, options = {}] = normalizeFilterItem(filterItem);
  const { type = 'copy' } = options;
  
  // 解析路径
  const parsedPath = parsePath(path);
  
  return {
    path: parsedPath,
    type: type // 'copy' 或 'deleted'
  };
}

/**
 * 检查文件路径是否匹配filter规则
 * @param {string} filePath - 文件路径（相对于jcr_root的路径，不包含开头的/）
 * @param {Array} filters - 解析后的filter对象数组
 * @returns {Object|null} 匹配的filter对象或null
 */
function getMatchingFilter(filePath, filters) {
 
  for (const filter of filters) {
    const filterPath = filter.path.replace(/^\/+/, '');
    if (filePath === filterPath || 
        filePath.startsWith(filterPath + '/')) {
      return filter;
    }
  }
  
  return null;
}

/**
 * 解压ZIP文件并根据filter配置复制文件到项目路径，完成后删除解压出来的文件
 * 只处理jcr_root目录下的内容
 * 如果目标位置已存在文件，则先删除再替换；如果不存在则直接创建
 * @param {string} zipFilePath - ZIP文件路径
 * @param {string} projectPath - 项目路径
 * @param {Array} filterPaths - filter路径数组（支持标签和纯路径）
 * @param {boolean} cleanupAfter - 是否在完成后删除解压的文件，默认为true
 */
async function unzipAndCopyByFilter(zipFilePath, projectPath, filterPaths, cleanupAfter = true) {
  // 创建临时目录用于解压
  const tempExtractPath = path.join(path.dirname(zipFilePath), `temp_extract_${Date.now()}`);
  
  try {
    // 检查ZIP文件是否存在
    if (!fs.existsSync(zipFilePath)) {
      console.error(`错误: ZIP文件不存在 - ${zipFilePath}`);
      return false;
    }

    // 检查项目路径是否存在
    if (!fs.existsSync(projectPath)) {
      console.error(`错误: 项目路径不存在 - ${projectPath}`);
      return false;
    }

    // 创建临时解压目录
    fs.ensureDirSync(tempExtractPath);

    // 使用adm-zip解压到临时目录
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(tempExtractPath, true); // true表示覆盖已存在的文件

    // 查找jcr_root目录
    const jcrRootPath = path.join(tempExtractPath, 'jcr_root');
    if (!fs.existsSync(jcrRootPath)) {
      console.error(`错误: 在解压的文件中未找到jcr_root目录`);
      fs.removeSync(tempExtractPath);
      return false;
    }

    let copiedFiles = 0;

    // 解析所有filter路径
    const parsedFilters = filterPaths.map(parseFilterItem);

    // 遍历jcr_root中的所有文件和目录
    const allItems = getAllFilesRecursive(jcrRootPath);
    
    for (const sourcePath of allItems) {
      // 获取相对于jcr_root的路径
      const relativePath = path.relative(jcrRootPath, sourcePath);
      
      // 检查该路径是否匹配任何filter规则
      const matchingFilter = getMatchingFilter(relativePath, parsedFilters);
      
      if (matchingFilter) {
        // 构建目标路径
        const destinationPath = path.join(projectPath, relativePath);
        
        try {
          if (matchingFilter.type === 'deleted') {
            // 删除操作：删除项目中对应的文件或目录
            if (fs.existsSync(destinationPath)) {
              await fs.remove(destinationPath);
              console.log(`已删除项目中的文件/目录: ${destinationPath}`);
            } else {
              console.log(`项目中不存在要删除的文件/目录: ${destinationPath}`);
            }
          } else {
            // 复制操作：确保目标目录存在
            await fs.ensureDir(path.dirname(destinationPath));
            
            // 删除目标路径中已存在的文件或目录
            if (fs.existsSync(destinationPath)) {
              await fs.remove(destinationPath);
            }
            
            // 复制文件或目录
            await fs.copy(sourcePath, destinationPath);
            
            copiedFiles++;
            console.log(`已复制 ${sourcePath} 到 ${destinationPath}`);
          }
        } catch (error) {
          console.error(`${matchingFilter.type === 'deleted' ? '删除' : '复制'}文件失败 ${sourcePath}: ${error.message}`);
        }
      }
    }

    console.log(`成功复制 ${copiedFiles} 个文件从 ${zipFilePath} 的jcr_root目录到项目路径 ${projectPath}`);
    
    // 根据参数决定是否删除解压的文件
    if (cleanupAfter) {
      // 使用fs-extra删除整个临时目录
      await fs.remove(tempExtractPath);
      console.log(`已清理临时解压目录: ${tempExtractPath}`);
    }
    
    return true;
  } catch (error) {
    console.error(`复制过程中发生错误: ${error.message}`);
    
    // 发生错误时也尝试清理临时目录
    if (fs.existsSync(tempExtractPath)) {
      try {
        await fs.remove(tempExtractPath);
      } catch (cleanupError) {
        console.error(`清理临时目录失败: ${cleanupError.message}`);
      }
    }
    
    return false;
  }
}

/**
 * 递归获取目录中的所有文件和文件夹
 * @param {string} dirPath - 目录路径
 * @returns {Array} 文件和文件夹路径数组
 */
function getAllFilesRecursive(dirPath) {
  let results = [];
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    results.push(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getAllFilesRecursive(itemPath));
    }
  });
  
  return results;
}

// 命令行参数处理
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('用法: node unzip-and-copy.js <zip文件路径> <项目路径> <filter路径1> [filter路径2] ... [--no-cleanup]');
    console.log('示例: node unzip-and-copy.js ./aem-package.zip /path/to/project "/apps/my-project"');
    console.log('示例: node unzip-and-copy.js ./aem-package.zip /path/to/project "<filter root=\"/apps/my-project\"/>"');
    console.log('注意: 默认只会处理jcr_root目录下的内容，并在完成后删除临时解压的文件，使用 --no-cleanup 参数可保留这些文件');
    process.exit(1);
  }
  
  // 解析参数
  const zipFilePath = args[0];
  const projectPath = args[1];
  let filterPaths = [];
  let cleanupAfter = true;
  
  // 处理filter路径和选项参数
  const pathArgs = args.slice(2);
  for (let i = 0; i < pathArgs.length; i++) {
    if (pathArgs[i] === '--no-cleanup') {
      cleanupAfter = false;
    } else {
      filterPaths.push(pathArgs[i]);
    }
  }
  
  unzipAndCopyByFilter(zipFilePath, projectPath, filterPaths, cleanupAfter);
}

module.exports = unzipAndCopyByFilter;