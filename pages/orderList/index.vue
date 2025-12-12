<template>
	<view class="order-list-contain">
		<nav-bar bgColor="#121325" title="我的订单" :opacity="isOpacity" />
		<scroll-view
			class="order-type"
			:scroll-x="true"
			:show-scrollbar="false"
			:scroll-into-view="'orderIndex-' + activeType"
		>
			<view
				:id="'orderIndex-' + item.key"
				class="order-type-item"
				:class="{ 'order-type-item-active': activeType == item.key }"
				v-for="item in orderTypeList"
				:key="item.key"
				@click="changeType(item)"
				>{{ item.name }}
				<image src="../../static/select-icon.png" v-show="activeType == item.key" />
			</view>
		</scroll-view>
		<scroll-view class="goods-list" :scroll-y="true" :show-scrollbar="false">
			<view class="goods-item" v-for="item in goodsList" :key="item.orderNumber">
				<view class="title-box">
					<view class="title">{{ item.merchant }}</view>
					<view class="order-types">{{ typeList[item.orderStatus] }}</view>
				</view>
				<view class="goods-info-box">
					<view class="left-box">
						<image :src="item.img" />
						<view class="order-name">
							<!-- 订单名称，最多显示两行 订单名称，最多显订单名称，最多显示两行 订单名称，最多显 -->
							{{ item.productName }}
						</view>
					</view>
					<view class="right-box">
						<view class="price"
							>￥<text class="number">{{ item.price }}</text></view
						>
						<view class="num">×<text class="number">1</text></view>
					</view>
				</view>
				<view class="order-btn-box">
					<view class="detail-btn" @click="goDetails(item)">查看详情</view>
					<view
						:class="item.orderStatus == 10 ? 'pay-btn' : 'detail-btn'"
						v-if="handleOrderStatus(item.orderStatus)"
						@click="handleDealOrder(item)"
						>{{ btnType[item.orderStatus] }}</view
					>
				</view>
			</view>
			
		</scroll-view>
		<view class="no-data">
				<u-empty mode="data" :show="goodsList.length == 0" iconSize="150"> </u-empty>
			</view>
		<Payment :show.sync="showPopup" :orderId="orderId" />
	</view>
</template>

<script>
import util from "@/common/util.js";
import Payment from "../../components/payment/index.vue";
export default {
	onLoad() {
		this.getOrderList();
	},
	onPageScroll(res) {
		if (res.scrollTop >= 45) {
			this.isOpacity = false;
		} else {
			this.isOpacity = true;
		}
	},
	components: {
		Payment,
	},
	data() {
		return {
			activeType: 0,
			scrollLeft: 0,
			showPopup: false,
			orderId: "",
			isOpacity: true,
			typeList: {
				10: "待付款",
				20: "待核销",
				30: "已完成",
				40: "退款中",
				50: "已退款",
				60: "失败",
			},
			btnType: {
				0: "",
				10: "立即付款",
				20: "申请退款",
				30: "申请退款",
			},
			orderTypeList: [
				{
					key: 0,
					name: "全部",
				},
				{
					key: "10",
					name: "待支付",
				},
				{
					key: "20",
					name: "待核销",
				},
				{
					key: "30",
					name: "已完成",
				},
				{
					key: "40",
					name: "退款审核",
				},
				{
					key: "50",
					name: "已退款",
				},
			],
			goodsList: [],
		};
	},
	methods: {
		changeType(item) {
			this.activeType = item.key;
			this.getOrderList();
		},
		async getOrderList() {
			let payload = {
				orderStatus: this.activeType,
			};
			let res = await util.get("/order/list", payload);
			if (res.code == 200) {
				this.goodsList = res.data || [];
			}
		},
		goDetails(item) {
			console.log("----item", item);
			uni.navigateTo({
				url: `/pages/orderDetail/index?id=${item.orderNumber}`,
			});
		},
		handleOrderStatus(item) {
			return item != 30 && item != 40 && item != 50 && item != 60;
		},
		// 处理支付和退款
		handleDealOrder(item) {
			// 支付
			if (item.orderStatus == "10") {
				this.payOrder(item);
			} else {
				// 退款
				this.refundOrder(item);
				console.log("----");
			}
		},
		payOrder(item) {
			uni.showLoading({
				title: "正在支付",
			});
			this.orderId = item.orderNumber;
			this.showPopup = true;
		},
		async refundOrder(item) {
			uni.showLoading({
				title: "退款中",
			});
			let res = await util.post(`/order/refundRequest?orderId=${item.orderNumber}`);
			if (res.code == 200) {
				uni.hideLoading();
				uni.showToast({
					icon: "none",
					title: "退款申请提交成功",
					duration: 2000,
				});
				this.getOrderList();
			} else {
				uni.hideLoading();
				uni.showToast({
					icon: "none",
					title: "退款申请提交失败",
					duration: 2000,
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
