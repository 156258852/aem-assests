const { spawn } = require('child_process');

// 启动开发服务器并在后台运行
console.log('正在启动开发服务器...');

const devProcess = spawn('npm', ['run', 'dev'], {
  cwd: '/Users/lhy/Desktop/code/demo/webpack-react-demo',
  stdio: 'ignore', // 忽略输入输出，让进程在后台运行
  detached: true, // 在独立模式下运行子进程
  env: process.env, // 继承当前环境变量
});

// 不将子进程作为当前进程的子进程，而是独立运行
devProcess.unref();

console.log(`开发服务器已启动，PID: ${devProcess.pid}`);
console.log('开发服务器将在后台继续运行，即使当前终端关闭');

// 等待服务器启动后再执行fetch请求
setTimeout(() => {
  fetch('http://localhost:3782/')
    .then(res => {
      console.log(res);
      // fetch请求完成后，主进程可以正常退出
      console.log('fetch请求完成，主进程退出');
    })
    .catch(err => {
      console.error('fetch请求失败:', err);
      console.log('主进程退出');
    });
}, 3000);
