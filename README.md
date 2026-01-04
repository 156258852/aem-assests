# AEM Assets 解压和复制工具

这个工具用于解压ZIP文件并将内容按照AEM filter规则复制到指定的项目路径，完成后会自动清理临时解压的文件。
现在还支持根据filter配置删除项目中的文件或目录。

## 安装依赖

```bash
npm install
```

## 使用方法

### 命令行使用

```bash
node unzip-and-copy.js <zip文件路径> <项目路径> <filter路径1> [filter路径2] ... [--no-cleanup]
```

例如：
```bash
# 使用纯路径格式的filter
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "/apps/my-project"
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "/apps/my-project" "/etc/designs/my-project"

# 使用标签格式的filter
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "<filter root=\"/apps/my-project\"/>"

# 混合使用标签和纯路径格式
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "<filter root=\"/apps/my-project\"/>" "/etc/designs/my-project"

# 使用 --no-cleanup 参数可保留临时解压的文件
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "/apps/my-project" --no-cleanup

# 使用删除操作的filter配置
node unzip-and-copy.js ./aem-package.zip /path/to/your/project "/apps/my-project" "[\"/content/dam/sample\", {\"type\": \"deleted\"}]"
```

### 在代码中使用

```javascript
const unzipAndCopyByFilter = require('./unzip-and-copy');

unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['/apps/my-project']);

// 使用标签格式的filter
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['<filter root="/apps/my-project"/>']);

// 混合使用标签和纯路径格式
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', [
  '<filter root="/apps/my-project"/>',
  '/etc/designs/my-project'
]);

// 使用删除操作的filter配置
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', [
  '/apps/my-project',                           // 正常复制的路径
  ['/content/dam/sample', {type: 'deleted'}]   // 要删除的路径
]);

unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['/apps/my-project'], false);
```

## AEM Filter 路径说明

在AEM中，filter路径可以是以下几种格式：

1. **数组格式**：
   - `['/apps/your-project-name']`
   - `['<filter root="/apps/your-project-name"/>']`
   - `['/apps/my-project', ['/content/dam/sample', {type: 'deleted'}]]`  // 混合复制和删除

2. **字符串格式**（使用换行符分隔多个路径）：
   - 传入字符串，内部会按换行符分割成多个路径
   - `'"/apps/my-project"\n"/content/dam/sample"'`

3. **纯路径格式**：
   - `/content/dam/your-project-name`

4. **标签格式**：
   - `<filter root="/apps/your-project-name"/>`
   - `<filter root="/etc/designs/your-project-name"/>`
   - `<filter root="/content/dam/your-project-name"/>`

5. **删除操作格式**：
   - `['/content/dam/sample', {type: 'deleted'}]` - 删除项目中的指定路径
   - `'!/content/dam/sample'` - 使用前缀方式删除项目中的指定路径（新功能）

常见的AEM filter路径包括：
- `/apps/your-project-name` - 应用程序特定的组件和模板
- `/etc/designs/your-project-name` - 项目的静态资源
- `/content/dam/your-project-name` - 项目的数字资产
- `/conf/your-project-name` - 项目的配置

## 注意事项

1. 确保项目路径存在且有适当的写入权限
2. 如果项目路径中已有同名文件或目录，会被删除并替换
3. 工具会保持原始ZIP文件中的目录结构
4. 只有匹配filter路径的文件才会被复制
5. filter参数可以是字符串（会按换行符分割）或数组格式
6. 默认只会处理`jcr_root`目录下的内容
7. 默认会在完成后删除临时解压的文件，使用`--no-cleanup`参数可保留这些文件
8. 删除操作只会影响项目中的文件和目录，不会影响ZIP包中的内容