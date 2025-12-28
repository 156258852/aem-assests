const chalk = require('chalk');

exports.info = message => console.log(chalk.cyan(message)); // eslint-disable-line
exports.success = message => console.log(chalk.green(message)); // eslint-disable-line
exports.warn = message => console.log(chalk.yellow(message)); // eslint-disable-line
exports.error = message => console.log(Chalk.red(message)); // eslint-disable-line
exports.log = (message, type = 'cyan') => console.log(chalk[type](message)); // eslint-disable-line
exports.logMessage = data => {
  const getValue = (value, type) => (type ? chalk[type](value) : value);
  const msg = data.reduce((m, d) => ({
    value: getValue(m.value, m.type) + getValue(d.value, d.type),
  }));
  console.log(msg.value); // eslint-disable-line
};

exports.checkGitStatus = async () => {
  const gitStatus = await exports.getShellOutput('git', ['status'], false);
  const workingTreeClean =
    gitStatus.includes('nothing to commit, working tree clean') ||
    gitStatus.includes('无文件要提交');
  // 没有变更则直接返回并发布
  if (workingTreeClean) {
    return;
  }
};
