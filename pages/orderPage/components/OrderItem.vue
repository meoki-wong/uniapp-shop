<template>
	<view class="order-item" @click="navigateToOrderDetail">
		<!-- 订单头部 -->
		<view class="order-header">
			<view class="shop_name_box">
				<image src="/static/img/shop_icons.png" mode="aspectFill" class="shop_icon" />
				<text class="store-name">{{ order.shopName }}</text>
			</view>
			<text
				v-if="order.orderState != 1 || isExpired"
				:class="['order-status', getStatusClass(order.orderState)]"
				>{{ cancelText || order.orderStateName }}</text
			>
			<view v-if="order.orderState == 1 && !isExpired" class="status-box">
				<view class="tips">等待付款</view>
				<view class="time">{{ formattedTime }}</view>
			</view>
		</view>

		<!-- 订单内容 -->
		<view class="order-content">
			<view class="store-image">
				<img :src="handleImg(order.shopDoorUrl)" mode="aspectFill" />
			</view>
			<view class="order-info">
				<view class="info-top">
					<view class="order-type">{{ order.shopName }}商品</view>
					<view class="order-category">{{ handleShopType(order.orderType) }}</view>
				</view>
				<view class="info-bottom">
					<text class="order-price">¥{{ order.orderAmount }}</text>
				</view>

				<view class="pay-btn" v-if="order.orderState == 1">
			<view class="cancel-btn" @click.stop="cancelOrder" v-if="!isExpired">取消</view>
			<view 
				class="confirm-btn" 
				@click.stop="goPay" 
				:class="{ 'disabled-btn': isExpired }"
			>{{  "去支付" }}</view>
		</view>
			</view>
		</view>
	</view>
</template>

<script>
import util from '@/common/util.js'
export default {
	props: {
		order: {
			type: Object,
			default: () => {},
		},
		categoryOptions: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			// 倒计时相关数据
			countdown: 30 * 60, // 30分钟，转换为秒
			isExpired: false,
			timer: null,
			// 假设订单创建时间，实际应该从order对象中获取
			orderCreateTime: null,
			cancelText: ""
		};
	},
	computed: {
		// 格式化倒计时显示
		formattedTime() {
			const minutes = Math.floor(this.countdown / 60);
			const seconds = this.countdown % 60;
			return `${minutes}分${seconds < 10 ? "0" : ""}${seconds}秒`;
		},
	},
	mounted() {
		// 如果订单状态是待支付，启动倒计时
		if (this.order.orderState == 1) {
			this.startCountdown();
		}

		console.log("订单详情======>>>", this.order);
	},
	beforeDestroy() {
		// 组件销毁前清除定时器
		if (this.timer) {
			clearInterval(this.timer);
		}
	},
	methods: {
		
		navigateToOrderDetail() {
			console.log('跳转到订单详情页: ' + this.order?.orderId);
			uni.navigateTo({
				url: `/pages/orderPage/orderDetails?id=${this.order?.orderId}`
			});
		},
		getStatusClass(status) {
			// switch (status) {
			//   case 'waiting':
			//     return 'status-waiting';
			//   case 'completed':
			//     return 'status-completed';
			//   case 'canceled':
			//     return 'status-canceled';
			//   default:
			//     return '';
			// }
			return "waiting";
		},
		goPay() {
			// 如果订单已过期，不允许支付
			if (this.isExpired) {
				uni.showToast({
					title: "订单已过期，无法支付",
					icon: "none",
				});
				return;
			}
			
			uni.navigateTo({
				url: "/pages/orderPage/payment?orderId=" + this.order?.orderId,
			});
		},
		handleImg(img) {
			let url = JSON.parse(img || "[]");
			return url[0]?.url;
		},
		handleShopType(type) {
			let name = this.categoryOptions.find((item) => type == item.value);
			return name ? name.label : "";
		},
		// 启动倒计时
		startCountdown() {
			// 使用订单中的remainingTime作为初始倒计时值
			if (this.order.remainingTime !== undefined && this.order.remainingTime !== null) {
				// 如果remainingTime为0，直接设置为已取消状态
				if (this.order.remainingTime === 0) {
					this.isExpired = true;
					return;
				}
				this.countdown = this.order.remainingTime;
			} else {
				// 如果没有剩余时间，默认设置为30分钟
				this.countdown = 30 * 60;
			}

			// 如果已经过期
			if (this.countdown <= 0) {
				this.isExpired = true;
				return;
			}

			// 启动定时器
			this.timer = setInterval(() => {
				this.countdown--;
				if (this.countdown <= 0) {
					this.isExpired = true;
					clearInterval(this.timer);
					// 可以在这里触发取消订单的逻辑
					this.$emit("order-expired", this.order);
				}
			}, 1000);
		},
		// 取消订单
		cancelOrder() {
			// 这里可以调用API取消订单
			util.post("/order/notPayCancel", { orderId: this.order?.orderId })
				.then((response) => {
					console.log("订单取消成功", response);
					if (response.code == "0000") {
						uni.showToast({
							title: "取消订单成功",
							icon: "none",
						});
						// 清除倒计时定时器
						if (this.timer) {
							clearInterval(this.timer);
							this.timer = null;
						}
						// 设置为已取消状态
						this.isExpired = true;
						// 更新订单状态为已取消
						// this.order.orderState = 6; // 假设6代表已取消状态
						this.cancelText = "已取消";
						this.$forceUpdate();
						console.log("取消订单成功------", this.order);
					} else {
						uni.showToast({
							title: "取消订单失败",
							icon: "none",
						});
					}
				})
				.catch((error) => {
					console.error("取消订单失败:", error);
					uni.showToast({
						title: "取消订单失败",
						icon: "none",
					});
				});
			// 触发取消订单事件，通知父组件
			// this.$emit('order-cancelled', this.order);
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./OrderItem.scss";
</style>
