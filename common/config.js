// 引入环境判断工具
import EnvUtils from './env.js';

// 获取当前环境信息
const currentEnv = EnvUtils.getEnvironment();

console.log('当前运行环境:', currentEnv);
//-----------项目配置 -----------
const ENV = {
    // 根据环境自动选择API地址
    baseUrlApi: currentEnv.isDev || currentEnv.isTrial 
        ? 'https://mall.stcoo.com/service/client'  // 开发/体验版地址
        : 'https://mall.stcoo.com/service/client', // 正式版地址（可以根据需要修改）
    
    payUrlApi: currentEnv.isDev || currentEnv.isTrial 
        ? 'https://mall.stcoo.com/tsh/payment/dev'  // 开发/体验版支付地址
        : 'https://mall.stcoo.com/tsh/payment/dev', // 正式版支付地址（可以根据需要修改）
    
    // 环境信息
    envInfo: {
        type: currentEnv.type,
        name: currentEnv.name,
        isDev: currentEnv.isDev,
        isTrial: currentEnv.isTrial,
        isRelease: currentEnv.isRelease
    }
};

// 打印当前环境信息（调试用）
console.log('当前运行环境信息:', ENV.envInfo);

export default ENV;