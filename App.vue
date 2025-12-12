<script>
import util from "@/common/util.js";
export default {
	onLaunch: function (options) {
		console.log("App Launch", options);
		if (options.query.q) {
			this.options.otherPage = true;
		}
		uni.hideTabBar();
		let token = uni.getStorageSync("token");
		if (!token) {
			this.login();
		}
		// 检测设备是否支持生物支付
		this.checkBiometricSupport();
	},
	data() {
		return {
			options: {
				otherPage: false,
			},
		};
	},
	onShow: function (options) {
		console.log("App Show", options);
	},
	onHide: function () {
		console.log("App Hide");
	},
	globalData: {},
	methods: {
		login() {
			uni.login({
				provider: "weixin", //使用微信登录
				success: async (loginRes) => {
					try {
						console.log("----thisoptions", loginRes);
						await this.getUserInfo(loginRes.code);
					} catch (err) {
						uni.showToast({
							icon: "none",
							title: "登录失败",
							duration: 1000,
						});
					}
				},
				fail: function (res) {
					uni.showToast({
						icon: "none",
						title: "登录失败",
						duration: 1000,
					});
				},
			});
		},
		// 获取用户信息
		async getUserInfo(code) {
			let res = await util.post("/wxminiLogin", { openIdCode: code });
			console.log("----res用户信息", res);
			if (res.code != "0000") {
				// 接口返回非200状态，跳转到登录页
				uni.navigateTo({
					url: "/pages/login/index",
					fail: function (err) {
						console.log("----res用户信息失败", err);
					},
				});
			} else {
				uni.setStorageSync("token", res.data?.token);

				let info = await util.get("/customer/getCustomerInfo");
				console.log("----res用户信息------>>看看走了这个逻辑没", info.code, info);
				if (info.code == "0000") {
					uni.setStorageSync("userInfo", { ...res.data, ...info.data });
				} else {
					uni.setStorageSync("userInfo", res.data);
				}
				// 接口返回200状态，保存用户信息

				// 获取当前页面路径，判断是否已经在首页
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				const currentRoute = currentPage.route;

				console.log("当前页面路径:", this.options.otherPage);
				// 跳转到path页面
				if (this.options.otherPage) {
					return;
				}
				// 如果当前页面不是首页，才执行跳转
				if (currentRoute !== "pages/home/list") {
					console.log("当前不在首页，执行跳转");
					uni.reLaunch({
						url: "/pages/home/list",
						success: () => {
							console.log("跳转首页成功");
						},
						fail: (err) => {
							console.error("跳转首页失败", err);
						},
					});
				} else {
					console.log("已在首页，无需跳转");
				}
			}
		},
		// 检测设备是否支持生物支付
		checkBiometricSupport() {
			// 检测是否支持生物识别
			uni.checkIsSupportSoterAuthentication({
				success: (res) => {
					console.log("支持的生物认证方式:", res);
					// 存储支持的生物认证方式
					uni.setStorageSync("biometricSupport", {
						supported: true,
						supportMode: res.supportMode || []
					});
				},
				fail: (err) => {
					console.log("不支持生物认证:", err);
					// 存储不支持生物认证的状态
					uni.setStorageSync("biometricSupport", {
						supported: false,
						supportMode: []
					});
				}
			});
		},
	},
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "uview/index.scss";

::-webkit-scrollbar {
	width: 0;
	height: 0;
}

.iconfont {
	font-family: "iconfont" !important;
	font-size: 16px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

// 设置整个项目的背景色
page {
	background-color: #f2f2f6;
}

/* #endif */
.example-info {
	font-size: 14px;
	color: #333;
	padding: 10px;
}

/* 页面左右的留边 */
.padCore {
	padding-left: 30rpx;
	padding-right: 30rpx;
}

/* #ifdef MP-WEIXIN */
wx-swiper .wx-swiper-dot {
	width: 8rpx;
	height: 8rpx;
}
/* #endif */
</style>
