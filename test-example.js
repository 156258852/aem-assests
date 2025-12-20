// 示例：如何使用unzipAndCopyByFilter函数

const unzipAndCopyByFilter = require('./unzip-and-copy');
const path = require('path');
const fs = require('fs');

// 示例1: 基本用法 - 单个filter路径（默认清理临时文件）
console.log('示例1: 解压AEM包并按单个filter路径复制文件到项目路径（默认清理）');
const zipPath1 = './example-aem-package.zip';  // ZIP文件路径
const projectPath1 = '/path/to/your/project';   // 项目路径
const filterPaths1 = ['/apps/my-project'];     // 纯路径格式

// 执行复制操作（默认只会处理jcr_root目录下的内容，并在完成后删除临时解压的文件）
// 如果项目路径中已存在文件，则先删除再替换；如果不存在则直接创建
const success1 = unzipAndCopyByFilter(zipPath1, projectPath1, filterPaths1);

if (success1) {
  console.log('文件已成功从jcr_root目录复制到项目路径\n');
} else {
  console.log('操作失败，请检查错误信息\n');
}

// 示例2: 使用标签格式的filter
console.log('示例2: 使用标签格式的filter路径复制文件到项目路径');
const zipPath2 = './example-aem-package.zip';
const projectPath2 = '/path/to/your/project';
const filterPaths2 = ['<filter root="/apps/my-project"/>']; // 标签格式

const success2 = unzipAndCopyByFilter(zipPath2, projectPath2, filterPaths2);

if (success2) {
  console.log('文件已成功按标签格式的filter路径从jcr_root目录复制到项目路径\n');
} else {
  console.log('操作失败，请检查错误信息\n');
}

// 示例3: 混合使用标签和纯路径格式
console.log('示例3: 混合使用标签和纯路径格式的filter');
const zipPath3 = './example-aem-package.zip';
const projectPath3 = '/path/to/your/project';
const filterPaths3 = [
  '<filter root="/apps/my-project"/>',     // 标签格式
  '/etc/designs/my-project',               // 纯路径格式
  '<filter root="/content/dam/my-project"/>' // 标签格式
];

const success3 = unzipAndCopyByFilter(zipPath3, projectPath3, filterPaths3);

if (success3) {
  console.log('文件已成功按混合格式的filter路径从jcr_root目录复制到项目路径\n');
} else {
  console.log('操作失败，请检查错误信息\n');
}

// 示例4: 保留临时解压的文件（不清理）
console.log('示例4: 解压AEM包并保留临时解压的文件');
const zipPath4 = './example-aem-package.zip';
const projectPath4 = '/path/to/your/project';
const filterPaths4 = ['<filter root="/apps/my-project"/>'];

// 第三个参数设置为false，表示不删除临时解压的文件
const success4 = unzipAndCopyByFilter(zipPath4, projectPath4, filterPaths4, false);

if (success4) {
  console.log('文件已成功从jcr_root目录复制到项目路径，临时文件已保留\n');
} else {
  console.log('操作失败，请检查错误信息\n');
}

// 示例5: 演示替换已存在的文件
console.log('示例5: 演示替换项目中已存在的文件');
// 首先创建一个测试项目目录结构
const testProjectDir = './test-project';
if (!fs.existsSync(testProjectDir)) {
  fs.mkdirSync(testProjectDir, { recursive: true });
}

// 在项目中创建一个已存在的文件结构
const existingDir = './test-project/apps/my-project/components';
if (!fs.existsSync(existingDir)) {
  fs.mkdirSync(existingDir, { recursive: true });
}

// 创建一个已存在的文件
const existingFile = './test-project/apps/my-project/components/existing.js';
fs.writeFileSync(existingFile, '// 这是一个已存在的文件');

console.log('已创建测试用的项目和已存在文件:', existingFile);

// 现在执行复制操作，应该会替换项目中已存在的文件
const zipPath5 = './example-aem-package.zip';
const projectPath5 = './test-project';
const filterPaths5 = ['<filter root="/apps/my-project"/>'];

const success5 = unzipAndCopyByFilter(zipPath5, projectPath5, filterPaths5);

if (success5) {
  console.log('文件已成功从jcr_root目录复制并替换项目中已存在的文件\n');
} else {
  console.log('操作失败，请检查错误信息\n');
}