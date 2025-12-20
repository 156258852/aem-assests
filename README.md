# AEM Assets 解压和复制工具

这个工具用于解压ZIP文件并将内容按照AEM filter规则复制到指定的项目路径，完成后会自动清理临时解压的文件。

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
```

### 在代码中使用

```javascript
const unzipAndCopyByFilter = require('./unzip-and-copy');

// 使用纯路径格式的filter（默认清理临时文件）
// 只处理jcr_root目录下的内容
// 如果项目路径中已存在文件，则先删除再替换；如果不存在则直接创建
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['/apps/my-project']);

// 使用标签格式的filter
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['<filter root="/apps/my-project"/>']);

// 混合使用标签和纯路径格式
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', [
  '<filter root="/apps/my-project"/>',
  '/etc/designs/my-project'
]);

// 保留临时解压的文件
unzipAndCopyByFilter('./aem-package.zip', '/path/to/your/project', ['/apps/my-project'], false);
```

## AEM Filter 路径说明

在AEM中，filter路径可以是以下两种格式：

1. **纯路径格式**：
   - `/apps/your-project-name`
   - `/etc/designs/your-project-name`
   - `/content/dam/your-project-name`

2. **标签格式**：
   - `<filter root="/apps/your-project-name"/>`
   - `<filter root="/etc/designs/your-project-name"/>`
   - `<filter root="/content/dam/your-project-name"/>`

常见的AEM filter路径包括：
- `/apps/your-project-name` - 应用程序特定的组件和模板
- `/etc/designs/your-project-name` - 设计相关文件
- `/content/dam/your-project-name` - 数字资产管理
- `/libs` - AEM内置库（通常不建议修改）

该工具会根据提供的filter路径数组筛选ZIP文件中`jcr_root`目录下的内容，并将匹配的文件按照原有的相对路径结构复制到指定的项目路径中。默认情况下，工具会在完成复制后自动删除临时解压的文件。

## 行为特点

1. 只处理ZIP文件中`jcr_root`目录下的内容
2. 如果项目路径中已存在同名文件或目录，会先删除再替换
3. 如果项目路径中不存在相应文件或目录，会直接创建
4. 保持原始ZIP文件中的目录结构
5. 只复制匹配filter路径的文件
6. 支持混合使用标签格式和纯路径格式的filter

## 注意事项

1. 确保项目路径存在且有适当的写入权限
2. 如果项目路径中已有同名文件或目录，会被删除并替换
3. 工具会保持原始ZIP文件中的目录结构
4. 只有匹配filter路径的文件才会被复制
5. 默认只会处理`jcr_root`目录下的内容
6. 默认会在完成后删除临时解压的文件，使用`--no-cleanup`参数可保留这些文件