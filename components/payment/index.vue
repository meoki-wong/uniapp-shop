<template>
	<view class="payment-contain">
		<u-popup v-model="show" mode="bottom" border-radius="24" height="732" @close="closePopup" @open="openPopup">
			<view class="inner-popup">
				<view class="pay-item" v-for="item in payList" :key="item.id">
					<image :src="item.url" />
					<view class="right-box" @click="selectPay(item)">
						<view class="pay-info">
							<view class="title">{{ item.payment }}</view>
							<view class="desc">{{ getDesc(item) }}</view>
						</view>
						<image :src="active.id == item.id ? checkedIcon : uncheckIcon" @click="selectPay(item)" />
					</view>
				</view>
				<view class="pay-btn" @click="handlePay"> 确认支付 </view>
				<view class="cancel" @click="cancel">取消</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { payList } from "./utils/common";
import util from "@/common/util.js";
export default {
	props: {
		show: {
			type: Boolean,
			default: false,
		},
		orderId: {
			type: [String, Number],
			default: "",
		},
		productId: {
			type: [String, Number],
			default: "",
		},
	},
	created() {
		this.handleSearchBalance();
	},
	data() {
		return {
			payList,
			checkedIcon: require("../../static/checked.png"),
			uncheckIcon: require("../../static/uncheck.png"),
			active: {},
			chargeData: 0.0,
		};
	},
	methods: {
		closePopup() {
			this.$emit("update:show", false);
			uni.hideLoading();
		},
		cancel() {
			this.closePopup();
		},
		selectPay(item) {
			this.active = item;
		},
		openPopup() {
			this.handleSearchBalance();
		},
		async handleSearchBalance() {
			let res = await util.get("/charge/balance");
			if (res.code == 200) {
				this.chargeData = res.data || 0.0;
			} else {
				this.chargeData = 0.0;
			}
		},
		getDesc(item) {
			return item.id == "chongzhi" ? (item.desc = `当前可用余额${this.chargeData}元`) : item.desc;
		},
		async handlePay() {
			if (!this.active.id) {
				uni.showToast({
					icon: "none",
					title: "请选择支付方式",
					duration: 1000,
				});
				return;
			}
			if (this.productId) {
				let res = await util.post(`/order/createOrder?productId=${this.productId}`);
				if (res.code == 200) {
					// 微信-0
					this.dealPayment(res.data);
				}
			}
			if (this.orderId) {
				this.dealPayment(this.orderId);
			}
		},
		async dealPayment(id) {
			let _this = this;
			let payResult = await util.post(`/order/pay?orderId=${id}&paymentMethod=${this.active.paymentKey}`);
			if (payResult.code == 200) {
				// 绿泡泡支付
				if (this.active.paymentKey == 0) {
					this.handleWXPay(payResult);
					return;
				}
				uni.showToast({
					icon: "none",
					title: "支付成功",
					duration: 1000,
				});
				if (!_this.orderId) {
					uni.navigateTo({
						url: "/pages/orderDetail/index?id=" + payResult.data.orderId,
					});
				}
				// 传递支付成功
				this.$emit('payStatus', 1);
				this.closePopup();
			} else {
				uni.showToast({
					icon: "none",
					title: payResult.msg || "支付异常，请重试",
					duration: 1000,
				});
				// 传递支付失败
				this.$emit('payStatus', 0);
			}
		},
		handleWXPay(payResult) {
			let _this = this;
			let payInfo = payResult.data?.payInfo || {};
			//  uni.requestSubscribeMessage({
			// 	tmplIds: [
			//             "qJh-x8czf64Kj2K7IOjTM4nmoWjhIXsDZViqmo0hvXw",
			//         ],
			// 	complete(res2){
			// console.log("-----resw2222", res2);
			uni.requestPayment({
				provider: "wxpay",
				timeStamp: payInfo.timeStamp,
				nonceStr: payInfo.nonceStr,
				package: payInfo.packageValue,
				signType: payInfo.signType,
				paySign: payInfo.paySign,
				success: function (payRes) {
					console.log("success:" + JSON.stringify(payRes));
					//支付完成跳转到订单详情页面
					if (!_this.orderId) {
						uni.navigateTo({
							url: "/pages/orderDetail/index?id=" + payResult.data.orderId,
						});
					}
					_this.closePopup();
				},
				fail: function (err) {
					uni.showToast({
						icon: "none",
						title: "支付失败，请重试",
						duration: 1000,
					});

					if (!_this.orderId) {
						uni.navigateTo({
							url: "/pages/orderDetail/index?id=" + payResult.data.orderId,
						});
					}
					_this.closePopup();
					console.log("fail:" + JSON.stringify(err));
				},
			});
			// }
			//  })
		},
	},
};
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
