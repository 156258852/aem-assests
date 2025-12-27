import { createGlobals, getCurrentDir, getCurrentFile } from './globals.js';

// 通过传递 import.meta.url，我们可以获取当前文件的路径信息
const { __dirname, __filename } = createGlobals(import.meta.url);

console.log('当前文件完整路径:', __filename);
console.log('当前文件所在目录:', __dirname);

// 另一种方式
console.log('通过 getCurrentDir 获取目录:', getCurrentDir(import.meta.url));
console.log('通过 getCurrentFile 获取文件:', getCurrentFile(import.meta.url));

// 如果不传递 import.meta.url，我们就无法知道是哪个模块在调用
// 因为每个模块的 import.meta.url 都是不同的