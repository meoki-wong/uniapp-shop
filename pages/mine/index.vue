<template>
	<view class="mine-contain">
		<nav-bar bgColor="#F63D10" class="status-bar-nav" title="我的" :is-back="false" titleColor="#fff" />

		<!-- 主体内容区域 -->
		<view class="main-content">
			<!-- 个人信息区域 -->
			<view class="user-info">
				<view class="avatar">
					<!-- 使用占位图片，实际使用时替换 -->
					<img :src="avatar" alt="用户头像" mode="aspectFill"/>
				</view>
				<view class="user-details">
					<view class="user-name">{{nickName || '微信用户'}}</view>
				</view>
			</view>

			<!-- 余额信息卡片 -->
			<view class="balance-card">
				<view class="balance-item" @click="goToPayList">
					<view class="balance-amount">{{ tokenBalance }}</view>
					<view class="balance-label">代币余额</view>
				</view>
				<view class="divider"></view>
				<view class="balance-item">
					<view class="balance-amount">{{ validCoupons }}</view>
					<view class="balance-label">有效卡券</view>
				</view>
			</view>

			<!-- 服务列表区域 -->
			<view class="service-section">
				<view class="section-header">
					<view class="section-title">我的服务</view>
				</view>
				<view class="service-list">
					<view class="service-item" @click="goToOrderList">
						<view class="service-icon">
							<img src="/static/img/order_mine.png" alt="全部订单" />
						</view>
						<view class="service-text">全部订单</view>
					</view>
					<view class="service-item" @click="goToChangePwd">
						<view class="service-icon">
							<img src="/static/img/setting_icon.png" alt="支付设置" />
						</view>
						<view class="service-text">支付设置</view>
					</view>
					<view class="service-item" @click="goToPersonalProfile">
						<view class="service-icon">
							<img src="/static/img/grzl_icon.png" alt="个人资料" />
						</view>
						<view class="service-text">个人资料</view>
					</view>
					<view class="service-item" @click="makePhoneCall">
						<view class="service-icon">
							<img src="/static/img/phone_icon.png" alt="售后电话" />
						</view>
						<view class="service-text">售后电话</view>
					</view>
				</view>
			</view>

			<!-- 消费统计区域 -->
			<view class="consumption-section">
				<view class="section-header">
					<view class="section-title">本月消费统计</view>
					<view class="section-date">{{ currentMonth }}</view>
				</view>
				<view class="consumption-stats">
					<view class="stat-item">
						<view class="stat-value">{{ totalConsumption }}</view>
						<view class="stat-label">消费总额</view>
					</view>
					<view class="divider"></view>
					<view class="stat-item">
						<view class="stat-value">{{ consumptionCount }}</view>
						<view class="stat-label">消费笔数</view>
					</view>
				</view>
			</view>
			<view class="logout-btn" @click="logout"> 退出登录 </view>
			<!-- 底部运营信息 -->
			<view class="operation-info">
				<view class="operation-text">{{operatorInfo}}</view>
				<view class="operation-text">合作方：安徽太湖农村商业银行股份有限公司</view>
			</view>
		</view>
		<Tabbar :activeIndex="3" />
	</view>
</template>

<script>
import Tabbar from "../../components/Tabbar/TabBar.vue";
import util from "@/common/util.js";
export default {
	data() {
		return {
			// 用户信息
			tokenBalance: "0",
			validCoupons: "0",
			totalConsumption: "0",
			consumptionCount: "0",
			currentMonth: "",
			nickName: "微信用户",
			avatar: "",
			user: {},
			operatorInfo: "",
			afterPhome: ""
		};
	},
	components: { Tabbar },
	onShow() {
		this.user = uni.getStorageSync("userInfo");
		this.getMineData()
	},
	onLoad() {
		this.handleDate()
	},
	created(){
		console.log("created")
	},
	methods: {

		async getMineData(){
			let res = await util.get("/customer/getCustomerInfo");
			if(res.code == '0000'){
				uni.setStorageSync("userInfo", {...this.user, ...res.data});
				this.nickName = res.data.customerName
				this.tokenBalance = res.data.balance
				this.validCoupons = res.data.couponNum || 0
				this.consumptionCount = res.data.orderNum || 0
				this.totalConsumption = res.data.orderTotal || 0
				this.avatar = res.data.avatar
			}
			this.getOperatorInfo()
			this.getAfterPhome()
		},
		async getOperatorInfo(){
			const res = await util.get(`/simpleConfig/findConfigure?configKey=OperatorInfo&tenantId=${this.user?.tenantId}`)
			if(res.code == '0000'){
				this.operatorInfo = res.data?.content || ''
			}
		},
		async getAfterPhome(){
			const res = await util.get(`/simpleConfig/findConfigure?configKey=afterPhome&tenantId=${this.user?.tenantId}`)
			if(res.code == '0000'){
				this.afterPhome = res.data?.content || ""
			}
		},
		// 跳转到订单列表页面
		goToOrderList() {
			uni.navigateTo({
				url: "/pages/orderPage/index",
			});
		},
		handleDate(){
			// 获取当前时间  yyyy-mm
			this.currentMonth = util.formatMonth(new Date());
		},
		// 跳转到我的余额页面
		goToPayList() {
			uni.navigateTo({
				url: `/pages/orderPage/payList?tokenBalance=${this.tokenBalance}`,
			});
		},
		// 跳转到修改密码页面
		goToChangePwd() {
			uni.navigateTo({
				url: "/pages/changePwd/index",
			});
		},
		goToPersonalProfile() {
			uni.navigateTo({
				url: "/pages/personalProfile/index",
			});
		},
		// 拨打电话
		makePhoneCall() {
			uni.makePhoneCall({
				phoneNumber: this.afterPhome, // 这里可以替换为实际的售后电话号码
				success: () => {
					console.log("拨打电话成功");
				},
				fail: (err) => {
					console.log("拨打电话失败", err);
				},
			});
		},
		async logout() {
			let res = await util.post("/wxminiLogout");
			console.log("resresres", res);
			if (res.code == "0000") {
				uni.showToast({
					title: "退出成功",
					icon: "success|none",
					mask: true,
				});
				uni.navigateTo({
					url: "/pages/login/index",
				});

			} else {
				uni.showToast({
					title: "退出失败",
					icon: "error|none",
					mask: true,
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
