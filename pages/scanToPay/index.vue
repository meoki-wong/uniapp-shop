<template>
	<view class="scan-to-pay-contain">
		<!-- 导航栏 -->
		<nav-bar bgColor="#FFF" title="扫码支付" :isShowHomeIcon="isShowHomeIcon" />

		<!-- 主内容区域 -->
		<view class="content">
			<!-- 商家信息区域 -->
			<view class="merchant-info">
				<!-- 商家Logo使用图片 -->
				<img :src="handleImg(shopInfo.shopDoorUrl)" class="merchant-logo" alt="商家logo" />
				<view class="merchant-text">
					<view class="merchant-name">{{ shopInfo.shopName }}</view>
					<view class="merchant-category">{{ handleShopType(shopInfo.shopType) }}</view>
				</view>
			</view>

			<!-- 支付金额区域 -->
			<view class="payment-info">
				<view class="payment-amount">
					<view class="amount-label">支付金额</view>
					<view class="amount-input-container">
						<text class="currency-symbol">¥</text>
						<input
							class="amount-input"
							type="digit"
							v-model="paymentAmount"
							placeholder="请输入金额"
							@input="inputAmount"
						/>
					</view>
				</view>
				<view class="payment-methods">
					<view class="method-item">
						<span class="method-label">可用代币</span>
						<span class="method-value">¥{{ totalBalance }}</span>
					</view>
					<view class="method-item">
						<span class="method-label">微信支付</span>
						<span class="method-value primary">¥{{ useCash }}</span>
					</view>
				</view>
			</view>

			<!-- 评分区域 -->
			<view class="rating-section">
				<view class="rating-label">一键评分</view>
				<view class="rating-stars">
					<view class="star" :class="{ selected: rating >= 1 }" @click="setRating(1)"
						><image
							:src="rating >= 1 ? '/static/img/collect_icon_active.svg' : '/static/img/collect_icon.svg'"
							mode="aspectFill"
					/></view>
					<view class="star" :class="{ selected: rating >= 2 }" @click="setRating(2)">
						<image
							:src="rating >= 2 ? '/static/img/collect_icon_active.svg' : '/static/img/collect_icon.svg'"
							mode="aspectFill"
						/>
					</view>
					<view class="star" :class="{ selected: rating >= 3 }" @click="setRating(3)">
						<image
							:src="rating >= 3 ? '/static/img/collect_icon_active.svg' : '/static/img/collect_icon.svg'"
							mode="aspectFill"
						/>
					</view>
					<view class="star" :class="{ selected: rating >= 4 }" @click="setRating(4)">
						<image
							:src="rating >= 4 ? '/static/img/collect_icon_active.svg' : '/static/img/collect_icon.svg'"
							mode="aspectFill"
						/>
					</view>
					<view class="star" :class="{ selected: rating >= 5 }" @click="setRating(5)">
						<image
							:src="rating >= 5 ? '/static/img/collect_icon_active.svg' : '/static/img/collect_icon.svg'"
							mode="aspectFill"
						/>
					</view>
				</view>
			</view>

			<!-- 备注输入框 -->
			<view class="remark-section">
				<view class="remark-label">添加备注<text class="remark-label_end">（100字以内）</text></view>
				<textarea class="remark-input" placeholder="请输入备注" maxlength="100" v-model="remark"></textarea>
				<view class="remark-count">{{ remarkLength }}/100</view>
			</view>
		</view>

		<!-- 底部确认支付按钮 -->
		<view class="bottom-button">
			<button class="confirm-pay-btn" @click="confirmPayment">确认支付</button>
		</view>

		<!-- 密码输入弹窗 -->
		<u-keyboard
			mode="number"
			:dot-enabled="false"
			:tooltip="true"
			:cancel-btn="true"
			:show-tips="false"
			confirm-text="忘记密码？"
			v-model="showPasswordPopup"
			@change="inputPassword"
			@backspace="deletePassword"
			@cancel="closePasswordPopup"
			@confirm="forgetPassword"
			ref="uKeyboard"
		>
			<view class="password-display">
				<view class="password-title"> 支付密码 </view>
				<view class="password-dots">
					<view
						class="password-dot"
						:class="{ filled: index < passwordInput.length }"
						v-for="(dot, index) in 6"
						:key="index"
					>
					</view>
				</view>
			</view>
		</u-keyboard>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			// 评分状态，默认为1颗星
			rating: 0,
			// 备注内容
			remark: "",
			// 支付金额
			paymentAmount: "",
			useAsset: 0,
			useCash: 0,
			shopInfo: {},
			categoryOptions: [],
			// 密码输入弹窗相关
			showPasswordPopup: false,
			passwordInput: "",
			orderPrice: 0,
			isShowHomeIcon: false,
			totalBalance: 0,
			// 首次加载标志，避免onLoad和onShow重复调用getBalanceTotal
			isFirstLoad: false,
			hasPayPass: false,
			// 生物支付相关状态
			biometricSupported: false, // 设备是否支持生物支付
			biometricEnabled: false,   // 用户是否开启了生物支付
			useBiometricPayment: false, // 是否使用生物支付
		};
	},
	computed: {
		// 计算备注长度
		remarkLength() {
			return this.remark.length;
		},
	},
	async onLoad(payload) {
		console.log("payload你看来不来得及----", payload);

		// 检查token是否存在，如果不存在则等待token获取完成
		let token = uni.getStorageSync("token");
		
		let retryCount = 0;
		const maxRetry = 20; // 最多等待20次，每次50ms，总共1秒

		// 如果token不存在，显示loading并等待App.vue中的登录流程完成
		if (!token) {
			uni.showLoading({
				title: "正在加载",
				mask: true,
			});

			while (!token && retryCount < maxRetry) {
				await new Promise((resolve) => setTimeout(resolve, 50));
				token = uni.getStorageSync("token");
				
				retryCount++;
				console.log(`等待token获取... ${retryCount}/${maxRetry}`);
			}

			uni.hideLoading();
		}
		if(token){
			this.getBalanceTotal()
		}
		// 如果仍然没有token，直接跳转到登录页
		if (!token) {
			console.log("未能获取到token，跳转到登录页");
			uni.navigateTo({
				url: "/pages/login/index",
			});
			return;
		}

		console.log("token已获取，继续执行页面逻辑");
		
		// 设置首次加载标志
		this.isFirstLoad = true;

		// 解析URL编码的字符串
		if (payload && (payload.code || payload.q)) {
			if (payload.q) {
				this.isShowHomeIcon = true;
			}
			const decodedUrl = decodeURIComponent(payload.code || payload.q || "");
			console.log("解码后的URL:", decodedUrl);

			// 从URL中提取id参数（使用纯字符串处理，兼容所有环境）
			const queryString = decodedUrl.split("?")[1] || "";
			const params = queryString.split("&");
			let id = null;

			for (let param of params) {
				const [key, value] = param.split("=");
				if (key === "id") {
					id = value;
					break;
				}
			}

			console.log("提取的id值:", id);
			await this.getShopType();
			// 使用提取的id值
			if (id) {
				this.getShopData(id);
			}
		}
	},
	onShow() {
		// 每次页面显示时检查token并获取余额（避免首次进入重复调用）
		const token = uni.getStorageSync("token");
		if (token && !this.isFirstLoad) {
			this.getBalanceTotal();
		}
		// 首次加载标志重置，确保后续页面显示能正常触发
		this.isFirstLoad = false;
	},
	methods: {
		async getBalanceTotal(){
			let res = await util.get("/customer/getCustomerInfo");
			if(res.code == '0000'){
				this.totalBalance = res.data.balance
				this.hasPayPass = res.data.hasPayPass
			} else {
				let userInfos = uni.getStorageSync("userInfo") || {};
				this.totalBalance = userInfos.balance || 0
				this.hasPayPass = userInfos.hasPayPass || false
			}
			
			// 获取设备是否支持生物支付
			const biometricSupport = uni.getStorageSync("biometricSupport");
			this.biometricSupported = biometricSupport && biometricSupport.supported;
			
			// 获取用户是否开启了生物支付
			const userInfo = uni.getStorageSync("userInfo");
			this.biometricEnabled = userInfo && userInfo.defaultPayWay === "2";
			
			// 判断是否使用生物支付：设备支持且用户已开启
			this.useBiometricPayment = this.biometricSupported && this.biometricEnabled;
			
			console.log("生物支付状态:", {
				supported: this.biometricSupported,
				enabled: this.biometricEnabled,
				useBiometric: this.useBiometricPayment
			});
		},
		forgetPassword() {
			uni.navigateTo({
				url: "/pages/changePwd/index",
			});
		},
		async getShopData(shopId) {
			uni.showLoading({
				title: "加载中",
			});
			let res = await util.post("/shop/simpleDetail", { shopId });
			uni.hideLoading();
			console.log("shopId", shopId);
			if (res.code == "0000") {
				this.shopInfo = res.data || {};
			} else{
				uni.showToast({
					title: res.msg || '获取商户信息失败',
					icon: "none",
					duration: 2000,
				});
			}
		},
		handleImg(img) {
			let url = JSON.parse(img || "[]");
			console.log("img------", img, url);
			return url[0]?.url;
		},
		handleShopType(type) {
			let name = this.categoryOptions.find((item) => type == item.value);
			return name ? name.label : "";
		},
		async getShopType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=ShopType");
			if (res.code == "0000") {
				this.categoryOptions =
					res.data.map((item) => {
						return {
							label: item.dictName,
							value: item.dictCode,
						};
					}) || [];
				this.categoryValue = this.categoryOptions[0].value;
			} else {
				this.categoryOptions = [];
			}
		},

		async inputAmount(e) {
			console.log("details", e.detail.value);
			let amount = e.detail.value;
			this.orderPrice = amount;
			let res = await util.post("/order/calPrice", { orderPrice: amount });
			if (res.code == "0000") {
				this.useAsset = res.data.useAsset;
				this.useCash = res.data.useCash;
			}
		},
		// 设置评分
		setRating(score) {
			this.rating = score;
		},
		// 确认支付
		confirmPayment() {
			// 验证支付金额
			if (!this.paymentAmount || parseFloat(this.paymentAmount) <= 0) {
				uni.showToast({
					title: "请输入正确的支付金额",
					icon: "none",
				});
				return;
			}

			// 判断是否使用代币支付
			if (this.useAsset != 0) {
				// 检查是否设置了支付密码
				console.log("是否设置了支付密码:", this.hasPayPass);
				
				// 如果没有设置支付密码，先提示前往设置
				if (!this.hasPayPass) {
					uni.showModal({
						title: '提示',
						content: '您还未设置支付密码，是否前往设置？',
						success: (res) => {
							if (res.confirm) {
								// 用户确认，跳转到设置密码页面
								uni.navigateTo({
									url: "/pages/changePwd/index",
									success() {
										this.paymentAmount = "";
									},
								});
							}
						}
					});
					return;
				}
				
				// 检查是否可以使用生物支付
				if (this.useBiometricPayment) {
					// 使用生物支付
					this.processBiometricPayment();
				} else {
					// 使用密码支付
					this.showPasswordInput();
				}
			} else {
				// 不使用代币，直接进行微信支付
				this.handleCreateOrder();
			}
		},
		async handleCreateOrder() {
			let payload = {
				orderPrice: this.orderPrice || 0,
				shopId: this.shopInfo.shopId,
				shopName: this.shopInfo.shopName,
				password: this.passwordInput,
				useAsset: this.useAsset,
				useCash: this.useCash,
				rating: this.rating,
				remark: this.remark,
			};
			let res = await util.post("/order/create", payload);
			uni.hideLoading();
			if (res.code == "0000") {
				// 关闭密码输入弹窗
				this.closePasswordPopup();

				if (res.data.orderStatus == "1") {
					this.processWechatPayment(res.data?.orderId);
				} else {
					uni.showToast({
						title: "支付成功",
						icon: "none",
						success() {
							uni.redirectTo({
								url: "/pages/orderPage/index?id=" + res.data.orderId,
							});
						},
					});
				}
			} else {
				uni.showToast({
					title: res.message || "支付有误",
					icon: "none",
				});
			}
		},
		// 显示密码输入框
		showPasswordInput() {
			this.showPasswordPopup = true;
			this.passwordInput = "";
		},

		// 关闭密码输入弹窗
		closePasswordPopup() {
			this.showPasswordPopup = false;
			this.passwordInput = "";
		},

		// 输入密码
		inputPassword(num) {
			if (this.passwordInput.length < 6) {
				this.passwordInput += num;

				// 当输入6位密码时，自动进行支付
				if (this.passwordInput.length === 6) {
					setTimeout(() => {
						this.processAssetPayment(this.passwordInput);
					}, 200);
				}
			}
		},

		// 删除密码
		deletePassword() {
			if (this.passwordInput.length > 0) {
				this.passwordInput = this.passwordInput.substring(0, this.passwordInput.length - 1);
			}
		},

		// 处理代币支付
		processAssetPayment(password) {
			// 显示加载提示
			uni.showLoading({
				title: "正在处理支付...",
				mask: true,
			});
			this.handleCreateOrder();
		},

		// 处理微信支付
		processWechatPayment(orderId) {
			// 显示加载提示
			uni.showLoading({
				title: "正在跳转支付...",
				mask: true,
			});

			// TODO: 调用后端接口获取微信支付参数
			// 这里应该替换为实际的支付接口调用

			uni.navigateTo({
				url: "/pages/orderPage/payment?orderId=" + orderId
			});
		},
		
		// 处理生物支付
		async processBiometricPayment() {
			try {
				// 显示加载提示
				uni.showLoading({
					title: "正在进行认证...",
					mask: true,
				});
				
				// 进行生物认证
				const biometricResult = await this.authenticateBiometric();
				
				// 认证成功，创建订单
				await this.handleCreateOrderWithBiometric(biometricResult);
				
			} catch (error) {
				console.error('生物支付失败:', error);
				uni.hideLoading();
				
				// 生物认证失败，直接使用密码支付
				// (这里不需要检查hasPayPass，因为confirmPayment已经确保用户设置了支付密码)
				this.showPasswordInput();
			}
		},
		
		// 使用生物认证创建订单
		async handleCreateOrderWithBiometric(biometricResult) {
			try {
				// 构建订单数据，与密码支付保持一致，只是添加biometrics参数
				let payload = {
					orderPrice: this.orderPrice || 0,
					shopId: this.shopInfo.shopId,
					shopName: this.shopInfo.shopName,
					password: '', // 生物支付时密码为空
					useAsset: this.useAsset,
					useCash: this.useCash,
					rating: this.rating,
					remark: this.remark,
					// 添加生物支付参数
					biometrics: {
						jsonSignature: biometricResult.jsonSignature,
						jsonString: biometricResult.jsonString
					}
				};
				
				// 创建订单
				const res = await util.post("/order/create", payload);
				
				if (res.code === '0000') {
					uni.hideLoading();
					uni.showToast({
						title: "支付成功",
						icon: "success",
						duration: 1500,
					});
					
					// 跳转到支付成功页面
					setTimeout(() => {
						uni.navigateTo({
							url: "/pages/orderPage/payment?orderId=" + res.data.orderId
						});
					}, 1500);
				} else {
					uni.hideLoading();
					uni.showToast({
						title: res.msg || "支付失败",
						icon: "none",
					});
				}
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: "网络错误，请重试",
					icon: "none",
				});
			}
		},
		
		// 处理生物支付认证
		async authenticateBiometric() {
			return new Promise((resolve, reject) => {
				// 检查设备支持的生物认证方式
				const biometricSupport = uni.getStorageSync("biometricSupport");
				const supportMode = biometricSupport ? biometricSupport.supportMode : [];
				
				// 优先使用指纹认证，如果没有则使用人脸识别
				const authMode = supportMode.includes('fingerPrint') ? 'fingerPrint' : 
								supportMode.includes('facial') ? 'facial' : null;
				
				if (!authMode) {
					reject(new Error('设备不支持生物认证'));
					return;
				}
				
				// 开始生物认证
				uni.startSoterAuthentication({
					requestAuthModes: [authMode],
					challenge: 'pay_' + Date.now(), // 使用时间戳作为挑战值
					authContent: '请验证身份以完成支付',
					success: (res) => {
						console.log('生物认证成功:', res);
						resolve({
							jsonSignature: res.resultJSON || '',
							jsonString: res.resultJSON || ''
						});
					},
					fail: (err) => {
						console.error('生物认证失败:', err);
						reject(err);
					}
				});
			});
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
