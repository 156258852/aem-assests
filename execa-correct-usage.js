const execa = require('execa');

/**
 * execa的正确使用方式
 */

// 1. 使用execa函数 - 直接执行命令，不经过shell解析器（推荐用于构建任务）
// 更安全，因为参数不会被shell解释
exports.spawn = (command, args = [], options = {}) => {
  return execa(command, args, {
    stdio: [0, 1, 2],
    ...options
  });
};

// 2. 使用execa.shell - 通过shell解析器执行命令（需要谨慎使用）
// 存在shell注入风险，特别是当命令包含用户输入时
exports.shell = (command, options = {}) => {
  return execa.shell(command, {
    stdio: [0, 1, 2],
    ...options
  });
};

// 3. 同步版本
exports.shellSync = (command, options = {}) => {
  return execa.shellSync(command, {
    stdio: [0, 1, 2],
    ...options
  });
};

// 4. 推荐的构建项目函数 - 使用execa而非execa.shell
exports.buildProject = async (projectPath, scriptName = 'build') => {
  try {
    console.log(`开始构建项目: ${projectPath}`);
    
    // 使用execa而非execa.shell，更安全
    const result = await execa('npm', ['run', scriptName], {
      cwd: projectPath,
      reject: true,
      stdio: ['pipe', 'inherit', 'inherit'] // 继承父进程的stdout和stderr
    });
    
    console.log(`项目构建成功: ${projectPath}`);
    return result;
  } catch (error) {
    console.error(`项目构建失败: ${projectPath}`, error.message);
    throw error;
  }
};

// 5. 同时构建多个项目
exports.buildMultipleProjects = async (projectPaths, scriptName = 'build') => {
  const buildPromises = projectPaths.map(projectPath => 
    exports.buildProject(projectPath, scriptName)
      .then(result => ({ projectPath, status: 'success', result }))
      .catch(error => ({ projectPath, status: 'failed', error: error.message }))
  );
  
  const results = await Promise.all(buildPromises);
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`构建完成: ${successful.length} 成功, ${failed.length} 失败`);
  
  return results;
};

// 示例用法
if (require.main === module) {
  // 示例：构建单个项目
  // exports.buildProject('/path/to/project')
  
  // 示例：构建多个项目
  // exports.buildMultipleProjects(['/path/to/project1', '/path/to/project2'])
}