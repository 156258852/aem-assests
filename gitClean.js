import { simpleGit } from 'simple-git';
import { getCurrentDir } from './globals.js';

const repoPath = getCurrentDir(import.meta.url);
const git = simpleGit(repoPath);

export const prepareForBuild = async () => {
  try {
    console.log('准备打包环境...');
    
    // 重置所有更改
    await git.reset(['--hard', 'HEAD']);
    console.log('✓ 已重置到最新提交');
    
    // 清理未跟踪文件
    await git.clean('f', ['-d', '-x']);
    console.log('✓ 已清理未跟踪文件');
    
    // 检查最终状态
    const status = await git.status();
    if (status.files.length === 0) {
      console.log('✓ 工作区干净，可以开始打包');
    } else {
      console.log('⚠ 工作区仍有更改:', status.files);
    }
    
    return true;
  } catch (error) {
    console.error('准备打包环境失败:', error.message);
    return false;
  }
};

// 执行清理
await prepareForBuild();