payment<template>
	<view class="payment-contain">
		<nav-bar title="确认支付" backIconColor="#fff" titleColor="#fff" :opacity="true" class="status-bar-nav" />
		<view class="top_bg">
			<image src="/static/img/zhifu_bg.png" mode="aspectFill" />
		</view>
		<view class="pay-info">
			<view class="price">￥{{payInfo.money / 100}}</view>
			<view class="order_id">订单号：{{ payInfo.orderId }}</view>
			<view class="dashed"></view>
			<view class="order_tips">订单已生成，请在30分钟之内付款</view>
			<view class="order_waring">请在规定时间内付款，否则订单将自动取消</view>
			<view class="order_time"
				>剩余时间：<text class="time">{{ countTime }}</text></view
			>
		</view>

		<view class="divider-box">
			<view class="divider"></view>
			<view class="text">支付方式</view>
			<view class="divider"></view>
		</view>
		<view class="pay-method">
			<view class="pay-method-item">
				<view class="pay-method-item-icon">
					<image src="/static/img/wechat_icon.png" mode="aspectFill"></image>
				</view>
				<view class="pay-method-item-text">微信支付</view>
			</view>
			<view class="select">
				<u-icon name="checkbox-mark" color="#fff" size="19"></u-icon>
			</view>
		</view>
		<view class="pay-btn" :class="{ disabled: !canPay }" @click="handlePay">支付</view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			orderId: "",
			payInfo: {},
			countTime: "00分00秒",
			timer: null,
			remainingSeconds: 0,
			canPay: false, // 控制支付按钮是否可点击
		};
	},
	async onLoad(payload) {
		this.orderId = payload.orderId;
		this.getPayInfo();
	},
	onUnload() {
		// 页面卸载时清除定时器
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	},
	methods: {
		async getPayInfo() {
			let payload = {
				orderId: this.orderId,
				paymentType: "weChatPay",
				payType: "JSAPI",
			};
            uni.showLoading({
				title: "获取订单信息",
                mask: true
			});
			let res = await util.post("/order/prepay-params", payload);
            uni.hideLoading();
			if (res.code == "SUCCESS") {
				this.payInfo = res.data;
				// 接口请求成功后，使用接口返回的remainingTime作为倒计时
				this.startCountdown(res.data.remainingTime);
				// 允许支付
				this.canPay = true;
			} else {
				uni.showToast({
					title: res.message || "获取订单信息失败",
					icon: "none",
				});
				// 接口请求失败，禁止支付
				this.canPay = false;
			}
		},

		// 开始倒计时
		startCountdown(remainingTime) {
			// 使用接口返回的remainingTime作为倒计时初始值
			// 如果没有提供remainingTime，则默认为30分钟（1800秒）
			this.remainingSeconds = remainingTime || 1800;

			// 如果剩余时间小于等于0，直接设置为不可支付状态
			if (this.remainingSeconds <= 0) {
				this.countTime = "00分00秒";
				this.canPay = false;
				uni.showToast({
					title: "支付时间已过期",
					icon: "none",
				});
				return;
			}

			// 清除可能存在的旧定时器
			if (this.timer) {
				clearInterval(this.timer);
			}

			// 立即更新一次显示
			this.updateCountdownDisplay();

			// 设置定时器，每秒更新一次
			this.timer = setInterval(() => {
				this.remainingSeconds--;
				this.updateCountdownDisplay();

				// 如果倒计时结束，清除定时器
				if (this.remainingSeconds <= 0) {
					clearInterval(this.timer);
					this.timer = null;
					// 倒计时结束，禁止支付
					this.canPay = false;
					uni.showToast({
						title: "支付时间已过期",
						icon: "none",
					});
				}
			}, 1000);
		},

		// 更新倒计时显示
		updateCountdownDisplay() {
			if (this.remainingSeconds <= 0) {
				this.countTime = "00分00秒";
				// 倒计时结束，禁止支付
				this.canPay = false;
				return;
			}

			// 计算分钟和秒数
			const minutes = Math.floor(this.remainingSeconds / 60);
			const seconds = this.remainingSeconds % 60;

			// 格式化为两位数
			const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
			const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

			// 更新显示
			this.countTime = `${formattedMinutes}分${formattedSeconds}秒`;
		},

		// 处理支付按钮点击
		handlePay() {
			if (!this.canPay) {
				uni.showToast({
					title: "支付不可用，请刷新重试",
					icon: "none",
				});
				return;
			}
            
			uni.showLoading({
				title: "获取支付信息",
				mask: true,
			});

            this.getWXPayParams()
		},

        
		async getWXPayParams() {
            let userInfo = uni.getStorageSync("userInfo");
            let payInfo = this.payInfo
			let payload = {
				orderId: this.orderId,
				orderPayType: payInfo.orderPayType,
				money: payInfo.money,
				microServiceName: payInfo.notifyMicroServiceName,
				prepayParamUrl: payInfo.prepayParamUrl,
				notifyMicroServiceUrl: payInfo.notifyMicroServiceUrl,
				paymentType: "weChatPay",
				payType: "JSAPI",
				openId: userInfo.openId,
				redirectUrl: "",
				currency: payInfo.currency,
				appName: payInfo.appName,
			};
			let res = await util.post("/api/payment/prepay", payload, true);
            uni.hideLoading();
            console.log("获取参数信息", res)
            
            if (res.code === "SUCCESS") {
                // 获取支付参数成功，调起微信支付
                this.handleWxPay(res.data);
            } else {
                uni.showToast({
                    title: res.message || "获取支付参数失败",
                    icon: "none",
                });
            }
		},

		handleWxPay(payParams) {
			let payInfo = payParams?.jsApiResult || {}
            console.log('payInfo------', payInfo);
			// 调起微信支付
			uni.requestPayment({
				provider: 'wxpay',
				timeStamp: payInfo.timestamp,
				nonceStr: payInfo.nonceStr,
				package: `prepay_id=${payInfo.prepay_id}`,
				signType: payInfo.signType || 'MD5',
				paySign: payInfo.paySign,
				success: (res) => {
					console.log("支付成功", res);
					uni.showToast({
						title: "支付成功",
						icon: "success",
					});
					
					// 支付成功后跳转到订单详情页或订单列表页
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/orderPage/index'
						});
					}, 1000);
				},
				fail: (err) => {
					console.error("支付失败", err);
					// 判断用户是否取消支付
					if (err.errMsg === "requestPayment:fail cancel") {
						uni.showToast({
							title: "您已取消支付",
							icon: "none",
						});
					} else {
						uni.showToast({
							title: "支付失败，请重试",
							icon: "none",
						});
					}
				}
			});
		}
	},
};
</script>

<style lang="scss" scoped>
@import "./payment.scss";
</style>
