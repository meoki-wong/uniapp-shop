<template>
	<view class="order-details-contain">
		<nav-bar bgColor="#FFF" title="订单明细" />

		<!-- 订单状态卡片 -->
		<view v-if="loadFinished">
			<view class="order-status-card">
			<view class="status-text">
				<!-- 完成状态显示 down_icon -->
				<image
					v-if="orderData.status === 'completed'"
					src="/static/img/down_icon.png"
					mode="aspectFill"
					class="status_icon"
				/>
				<!-- 取消状态显示 cancel_icon -->
				<image
					v-else-if="orderData.status === 'cancelled' || orderData.status === 'refunded'"
					src="/static/img/cancel_icon.png"
					mode="aspectFill"
					class="status_icon"
				/>
				<!-- 待支付状态显示 wait_icon -->
				<image
					v-else-if="orderData.status === 'pending'"
					src="/static/img/wait_icon.png"
					mode="aspectFill"
					class="status_icon"
				/>
				{{ orderData.statusText }}
			</view>
			<view class="pre-box" v-if="orderData.status == 'pending' && !isExpired">
				<view class="pre-pay-info">需付款：￥{{ orderData.actualAmount }} 剩余时间: {{ formattedTime }}</view>
				<view class="pay-btn" @click="goPay">去支付</view>
			</view>
			<view class="shop-info">
				<image src="/static/img/shop_icons.png" mode="aspectFill" class="shop-icon" />
				<text class="store-name">{{ orderData.shopName }}</text>
				<text class="order-price">¥{{ orderData.orderAmount || 0 }}</text>
			</view>
			<view class="shop-address">
				<image src="/static/img/address_icon.png" mode="aspectFill" class="shop-icon" />
				<text class="address-text">{{ orderData.address }}</text>
			</view>
		</view>

		<!-- 消费信息区块 -->
		<view class="info-section">
			<view class="info-item">
				<text class="info-label">消费类型</text>
				<text class="info-value">{{ handleShopType(orderData.orderType) }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">消费说明</text>
				<text class="info-value">{{ orderData.shopName || "未知" }}商品</text>
			</view>
			<view class="info-item">
				<text class="info-label">商家名称</text>
				<text class="info-value">{{ orderData.shopName || "未知" }}</text>
			</view>
		</view>

		<!-- 订单编号和支付时间区块 -->
		<view class="order-info-section">
			<view class="info-item">
				<text class="info-label">订单编号</text>
				<text class="info-value">{{ orderData.orderId || "未知" }}</text>
			</view>
			<view class="info-item" v-if="orderData.status == 'completed'">
				<text class="info-label">支付时间</text>
				<text class="info-value">{{ orderData.orderTime }}</text>
			</view>
			<!-- 取消状态 -->
			<view class="info-item" v-if="orderData.status == 'cancelled'">
				<text class="info-label">取消时间</text>
				<text class="info-value">{{ orderData.cancelTime }}</text>
			</view>
			<view class="info-item" v-if="orderData.status == 'cancelled'">
				<text class="info-label">取消说明</text>
				<text class="info-value">{{ orderData.cancelRemark || '暂无说明' }}</text>
			</view>
			<!-- 取消状态 -->
		</view>

		<!-- 支付详情区块 -->
		<view class="payment-section" v-if="orderData.status != 'cancelled'">
			<view class="info-item">
				<text class="info-label">商品总额</text>
				<text class="info-value">¥{{ orderData.orderAmount || 0 }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">代币支付</text>
				<text class="info-value">¥{{ orderData.deductedAsset || 0 }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">微信支付</text>
				<text class="info-value">¥{{ orderData.actualAmount || 0 }}</text>
			</view>
			<view class="info-item" v-if="orderData.status != 'refunded'">
				<text class="info-label">退款时间</text>
				<text class="info-value">¥{{ orderData.afterSaleTime || '暂无时间' }}</text>
			</view>
		</view>
		<!-- orderData.status === 'pending' -->
		<view class="options" v-if="orderData.status == 'pending' && !isExpired">
			<view class="cancel-btn" @click="cancelOrder">取消</view>
			<view class="confirm-btn" @click="goPay">立即支付￥{{ orderData.actualAmount || 0 }}</view>
		</view>
		</view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			orderId: "",
			categoryOptions: [],
			// 倒计时相关数据
			countdown: 0, // 剩余秒数
			isExpired: false, // 是否已过期
			timer: null, // 定时器引用
			loadFinished: false,
			orderData: {},
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
	async onLoad(options) {
		console.log("orderId:", options);
		// 接收从订单列表页传递过来的订单ID
		if (options && options.id) {
			this.orderId = options.id;
			await this.getShopType();
			// 实际项目中这里应该调用API获取订单详情
			this.getOrderDetails(options.id);

			// 模拟根据接口返回的状态码设置订单状态
			// 在实际项目中，状态码应该从API返回的数据中获取
			// 例如：this.updateOrderStatus(response.data.status);
			// this.updateOrderStatus('5'); // 可以是'1'(待付款)、'2'(已取消)、'3'(已完成)
		}
	},
	
	beforeDestroy() {
		console.log("beforeDestroy------");
		// 组件销毁前清除定时器
		if (this.timer) {
			clearInterval(this.timer);
		}
	},
	methods: {
		// 获取订单详情（实际项目中会实现）
		getOrderDetails(orderId) {
			// 调用API获取订单详情数据
			uni.showLoading({
				title: "加载中",
				mask: true,
			});
			this.loadFinished = false;
			util.post("/order/detail", { orderId })
				.then((response) => {
					this.loadFinished = true;
					uni.hideLoading();
					// 更新订单数据
					console.log("订单详情", response.data);
					this.orderData = response.data || {};

					// 根据接口返回的状态码更新订单状态
					this.updateOrderStatus(response.data?.orderState);

					// 如果订单状态是待支付，启动倒计时
					if (response.data.orderState === "1") {
						this.startCountdown(response.data.remainingTime);
					}
				})
				.catch((error) => {
					uni.hideLoading();
					this.loadFinished = true;
					console.error("获取订单详情失败:", error);
				});
		},
		goPay() {
			uni.navigateTo({
				url: "/pages/orderPage/payment?orderId=" + this.orderData?.orderId,
			});
		},
		async getShopType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=ShopType");
			console.log("筛选触发内容", res);
			if (res.code == "0000") {
				this.categoryOptions =
					res.data.map((item) => {
						return {
							label: item.dictName,
							value: item.dictCode,
						};
					}) || [];
			} else {
				this.categoryOptions = [];
			}
		},
		handleShopType(type) {
			let name = this.categoryOptions.find((item) => type == item.value);
			return name ? name.label : "";
		},
		// 根据接口返回的状态码更新订单状态
		updateOrderStatus(statusCode) {
			// 根据接口字段判断订单状态
			switch (statusCode) {
				case "1": // 待付款
					this.orderData.status = "pending";
					this.orderData.statusText = "订单待付款";
					break;
				case "6": // 已取消
					this.orderData.status = "cancelled";
					this.orderData.statusText = "订单已取消";
					break;
				case "5": // 已完成
					this.orderData.status = "completed";
					this.orderData.statusText = "订单已完成";
					break;
				case "7": // 已退款
					this.orderData.status = "refunded";
					this.orderData.statusText = "订单已退款";
					break;
				default:
					// 默认为已完成状态
					this.orderData.status = "fail";
					this.orderData.statusText = "订单查询失败";
			}
		},
		// 启动倒计时
		startCountdown(remainingTime) {
			// 使用接口返回的remainingTime作为初始倒计时值
			if (remainingTime !== undefined && remainingTime !== null) {
				// 如果remainingTime为0，直接设置为已取消状态
				if (remainingTime === 0) {
					this.isExpired = true;
					this.orderData.status = "cancelled";
					this.orderData.statusText = "订单已取消";
					return;
				}
				this.countdown = remainingTime;
			} else {
				// 如果没有剩余时间，默认设置为30分钟
				this.countdown = 30 * 60;
			}

			// 如果已经过期
			if (this.countdown <= 0) {
				this.isExpired = true;
				this.orderData.status = "cancelled";
				this.orderData.statusText = "订单已取消";
				return;
			}

			// 启动定时器
			console.log("倒计时开始---");
			this.timer = setInterval(() => {
				this.countdown--;
				if (this.countdown <= 0) {
					this.isExpired = true;
					this.orderData.status = "cancelled";
					this.orderData.statusText = "订单已取消";
					clearInterval(this.timer);
				}
			}, 1000);
		},
		// 取消订单
		cancelOrder() {
			// 这里可以调用API取消订单
			util.post("/order/notPayCancel", { orderId: this.orderId })
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
						this.orderData.status = "cancelled";
						this.orderData.statusText = "订单已取消";
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
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./orderDetails.scss";
</style>
