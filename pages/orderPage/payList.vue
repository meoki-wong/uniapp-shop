<template>
	<view class="pay-list-contain">
		<nav-bar bgColor="#FFF" title="我的余额" />

		<!-- 代币余额卡片 -->
		<view class="balance-card">
			<view class="balance-info">
				<view class="balance-label">代币余额</view>
				<view class="balance-amount">{{ formatBalance(tokenBalance) }}</view>
			</view>
			<view class="balance-icon">
				<image class="money_icon" src="/static/img/money_icon.png" mode="aspectFill" />
			</view>
		</view>

		<!-- 标签页 -->
		<view class="tabs">
			<view
				class="tab-item"
				v-for="item in tabList"
				:key="item.dictCode"
				:class="{ active: activeTab === item.dictCode }"
				@click="switchTab(item.dictCode)"
				>{{ item.dictName }}</view
			>
			<!-- <view class="tab-item" :class="{ active: activeTab === 'deduct' }" @click="switchTab('deduct')">扣除</view>
      <view class="tab-item" :class="{ active: activeTab === 'recharge' }" @click="switchTab('recharge')">充值</view> -->
		</view>

		<!-- 列表容器 -->
		<scroll-view scroll-y class="list-container" @scrolltolower="loadMore" :show-scrollbar="false">
			<view class="list-item" v-for="(item, index) in listData" :key="index">
				<view class="item-header">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-amount" :class="item.amount > 0 ? 'positive' : 'negative'">
						{{ item.amount > 0 ? "+" : "-" }}{{ formatAmount(item.amount) }}
					</view>
				</view>
				<view class="item-merchant">{{ item.description }}</view>
				<view class="item-time">{{ item.tradeTime }}</view>
			</view>

			<!-- 加载更多提示 -->
			<view class="load-more" v-if="loading">加载中...</view>
			<view class="load-more" v-else-if="!hasMore">没有更多数据了</view>
		</scroll-view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			tokenBalance: 8666,
			activeTab: "",
			total: 0,
			listData: [],
			tabList: [
				{
					dictCode: "",
					dictName: "全部",
				},
			],
			loading: false,
			hasMore: true,
			page: 0,
			pageSize: 10,
		};
	},

	async onLoad(payload) {
		await this.getCustomerAssetChangelogType();
		// 页面加载时可以调用获取数据的方法
		this.tokenBalance = payload.tokenBalance;
		this.loadMore();
	},
	methods: {
		// 切换标签页
		switchTab(tab) {
			this.activeTab = tab;
			// 切换标签时可以重新加载对应的数据
			this.page = 0;
			this.listData = [];
			this.hasMore = true;
			this.loadMore();
		},

		// 暂时不用
		amountPurpose() {
			let nameObj = this.tabList.find((item) => item.dictCode === this.activeTab);
			return nameObj?.dictName;
		},

		async getCustomerAssetChangelogType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=CustomerAssetChangelogType");
			if (res.code == "0000") {
				this.tabList.push(...res.data);
			}
		},

		// 格式化余额显示
		formatBalance(balance) {
			return balance.toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},

		// 格式化金额显示
		formatAmount(amount) {
			return Math.abs(amount).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		},
		async getData() {
			let payload = {
				pageNum: this.page,
				pageSize: 10,
				type: this.activeTab,
			};
			uni.showLoading({
				title: "加载中",
				mask: true,
			});
			let res = await util.post("/customerAssetChangelog/pageList", payload);
			uni.hideLoading();
			if (res.code == "0000") {
				this.listData = [...this.listData, ...(res.data?.records || [])];
				this.total = res.data?.total || 0;
				this.hasMore = res.data?.total > this.page * 10;
				this.loading = false;
			}
		},
		// 加载更多数据
		loadMore() {
			console.log("loading", this.loading, this.hasMore);
			if (this.loading || !this.hasMore) return;
			++this.page;
			this.loading = true;
			// 模拟异步加载数据
			this.getData();
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./payList.scss";

// 为容器添加顶部内边距，避免navbar遮挡
.pay-list-contain {
	padding-top: 88rpx;
}

// 滚动容器样式补充
.list-container {
	height: calc(100vh - 88rpx - 260rpx - 88rpx); // 减去导航栏、余额卡片和标签页的高度

	.load-more {
		text-align: center;
		padding: 30rpx 0;
		color: #999;
		font-size: 24rpx;
	}
}
</style>
