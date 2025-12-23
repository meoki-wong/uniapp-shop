// 小程序环境判断工具
const EnvUtils = {
    // 获取当前运行环境
    getEnvironment() {
        // #ifdef MP-WEIXIN
        // 微信小程序环境判断
        if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
            const accountInfo = wx.getAccountInfoSync();
            const envVersion = accountInfo.miniProgram.envVersion;
            
            switch (envVersion) {
                case 'develop':
                    return {
                        type: 'develop',
                        name: '开发版',
                        isDev: true,
                        isTrial: false,
                        isRelease: false
                    };
                case 'trial':
                    return {
                        type: 'trial',
                        name: '体验版',
                        isDev: false,
                        isTrial: true,
                        isRelease: false
                    };
                case 'release':
                    return {
                        type: 'release',
                        name: '正式版',
                        isDev: false,
                        isTrial: false,
                        isRelease: true
                    };
                default:
                    return {
                        type: 'unknown',
                        name: '未知环境',
                        isDev: false,
                        isTrial: false,
                        isRelease: false
                    };
            }
        }
        // #endif
        
        // #ifdef MP-ALIPAY
        // 支付宝小程序环境判断
        if (typeof my !== 'undefined' && my.getEnv) {
            return new Promise((resolve) => {
                my.getEnv({
                    success: (res) => {
                        const env = res.env;
                        resolve({
                            type: env,
                            name: env === 'development' ? '开发版' : env === 'trial' ? '体验版' : '正式版',
                            isDev: env === 'development',
                            isTrial: env === 'trial',
                            isRelease: env === 'release'
                        });
                    },
                    fail: () => {
                        resolve({
                            type: 'unknown',
                            name: '未知环境',
                            isDev: false,
                            isTrial: false,
                            isRelease: false
                        });
                    }
                });
            });
        }
        // #endif
        
        // 默认返回开发环境
        return {
            type: 'develop',
            name: '开发环境',
            isDev: true,
            isTrial: false,
            isRelease: false
        };
    },
    
    // 判断是否为开发环境
    isDev() {
        const env = this.getEnvironment();
        return env.isDev;
    },
    
    // 判断是否为体验版
    isTrial() {
        const env = this.getEnvironment();
        return env.isTrial;
    },
    
    // 判断是否为正式版
    isRelease() {
        const env = this.getEnvironment();
        return env.isRelease;
    },
    
   
    
    // 打印当前环境信息（调试用）
    logEnvironment() {
        const env = this.getEnvironment();
        console.log('当前运行环境:', env);
        console.log('环境类型:', env.type);
        console.log('环境名称:', env.name);
        console.log('是否为开发版:', env.isDev);
        console.log('是否为体验版:', env.isTrial);
        console.log('是否为正式版:', env.isRelease);
    }
};

export default EnvUtils;