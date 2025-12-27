const execa = require('execa');

/**
 * execa的正确使用方式 - 何时使用数组参数 vs 字符串命令
 */

// 1. 使用数组参数 - 推荐用于构建任务等场景（更安全）
// 格式: execa(command, argumentsArray, options)
exports.runBuildWithArray = async (projectPath) => {
  try {
    console.log(`使用数组参数构建项目: ${projectPath}`);
    
    // 推荐方式 - 更安全，防止命令注入
    const result = await execa('npm', ['run', 'build'], {
      cwd: projectPath,
      reject: true,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    console.log(`项目构建成功: ${projectPath}`);
    return result;
  } catch (error) {
    console.error(`项目构建失败: ${projectPath}`, error.message);
    throw error;
  }
};

// 2. 使用execa.shell - 仅在需要shell特性时使用
// 格式: execa.shell(commandString, options)
exports.runCommandWithShell = async (command, projectPath) => {
  try {
    console.log(`使用shell执行命令: ${command}`);
    
    // 仅在需要shell特性（如管道、重定向）时使用
    const result = await execa.shell(command, {
      cwd: projectPath,
      reject: true,
      stdio: ['pipe', 'inherit', 'inherit']
    });
    
    console.log(`命令执行成功: ${command}`);
    return result;
  } catch (error) {
    console.error(`命令执行失败: ${command}`, error.message);
    throw error;
  }
};

// 3. 使用数组参数的更多示例
exports.runMultipleCommands = async (projectPath) => {
  // 执行带参数的命令
  await execa('npm', ['install'], { cwd: projectPath });
  
  // 执行带选项的命令
  await execa('npm', ['run', 'build', '--', '--production'], { cwd: projectPath });
  
  // 执行系统命令
  await execa('ls', ['-la'], { cwd: projectPath });
  
  // 执行带环境变量的命令
  await execa('npm', ['run', 'build'], {
    cwd: projectPath,
    env: { NODE_ENV: 'production' }
  });
};

// 4. 使用shell的示例 - 仅在需要shell特性时
exports.runShellFeatures = async (projectPath) => {
  // 需要管道操作时
  await execa.shell('npm run build | grep -i success', {
    cwd: projectPath
  });
  
  // 需要重定向时
  await execa.shell('npm run build > build.log 2>&1', {
    cwd: projectPath
  });
  
  // 需要通配符时
  await execa.shell('ls dist/*.js', {
    cwd: projectPath
  });
};

// 5. 安全示例 - 如何处理用户输入
exports.runBuildWithUserInput = async (projectPath, scriptName) => {
  // ❌ 错误 - 如果scriptName包含恶意内容，可能会被执行
  // await execa.shell(`npm run ${scriptName}`, { cwd: projectPath });
  
  // ✅ 正确 - 使用数组参数，安全处理用户输入
  const result = await execa('npm', ['run', scriptName], {
    cwd: projectPath,
    reject: true
  });
  
  return result;
};

// 6. 同时构建多个项目
exports.buildMultipleProjects = async (projectPaths, scriptName = 'build') => {
  const buildPromises = projectPaths.map(projectPath => 
    exports.runBuildWithArray(projectPath)
      .then(result => ({ projectPath, status: 'success', result }))
      .catch(error => ({ projectPath, status: 'failed', error: error.message }))
  );
  
  const results = await Promise.all(buildPromises);
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`构建完成: ${successful.length} 成功, ${failed.length} 失败`);
  
  return results;
};

// 总结使用建议
console.log(`
使用execa时的建议：
1. 一般情况下使用: execa(command, argsArray, options)
   - 更安全，防止命令注入
   - 适用于构建、安装依赖等常规操作

2. 需要shell特性时使用: execa.shell(commandString, options)
   - 仅在需要管道、重定向、通配符等shell特性时使用
   - 存在安全风险，避免在命令中包含用户输入
`);

// 示例用法
if (require.main === module) {
  // 示例：构建单个项目
  // exports.runBuildWithArray('/path/to/project')
  
  // 示例：构建多个项目
  // exports.buildMultipleProjects(['/path/to/project1', '/path/to/project2'])
}