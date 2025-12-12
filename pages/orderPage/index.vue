<template>
	<view class="order-contain">
		<!-- 导航栏 -->
		<view class="top_box">
			<nav-bar bgColor="#FFF" title="全部订单" />

		<!-- 搜索区域 -->
		<view class="search-section">
			<view class="search-box">
				<input class="search-input" placeholder="请输入关键字搜索" v-model="searchKeyword" />
				<view class="search-icon" @click="searchOrder">
					<u-icon name="search" size="32" color="#FFFFFF" />
				</view>
			</view>

			<!-- 订单状态筛选 -->
			<view class="status-filter">
				<view
					v-for="(item, index) in statusFilters"
					:key="index"
					class="filter-item"
					:class="{ active: activeStatus === item.value }"
					@click="changeStatus(item.value)"
				>
					{{ item.label }}
				</view>
			</view>
		</view>
		</view>

		<!-- 订单列表 -->
		<scroll-view
			class="order-list"
			scroll-y
			:scroll-top="scrollTop"
			@scrolltolower="loadMore"
			lower-threshold="100"
			:show-scrollbar="false"
		>
			<view v-for="order in orderList" :key="order.orderId">
				<OrderItem :order="order" :categoryOptions="categoryOptions"/>
			</view>

			<!-- 空状态提示 -->
			<view v-if="orderList.length === 0" class="empty-state">
				<u-empty mode="order" text="暂无相关订单"> </u-empty>
			</view>

			<!-- 加载更多 -->
			<view v-if="loading" class="load-more">
				<u-loading size="20" color="#f63d10"></u-loading>
				<text class="load-text">加载中...</text>
			</view>

			<!-- 没有更多数据 -->
			<view v-if="!hasMore && orderList.length > 0" class="no-more">
				<text class="no-more-text">没有更多数据了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import util from "@/common/util.js";
import OrderItem from './components/OrderItem.vue'
export default {
	data() {
		return {
			searchKeyword: "",
			activeStatus: "",
			scrollTop: 0,
			page: 0,
			pageSize: 10,
			loading: false,
			hasMore: true,
			categoryOptions: [],
			statusFilters: [],
			orderList: [
			],
		};
	},
	components: {
		OrderItem
	},
	computed: {
	},
	async mounted(){
		console.log('list onload')
		await this.getShopType()
		await this.getStatusType()
		this.loadMore()
	},
	methods: {
		searchOrder(){
			if(!String(this.searchKeyword)){
				uni.showToast({
					title: "请输入搜索内容",
					icon: "none",
				});
				return 
			}
			this.resetPagination()
		},
		handleImg(img) {
			let url = JSON.parse(img || "[]");
			return url[0]?.url;
		},
		// 切换订单状态
		changeStatus(status) {
			this.activeStatus = status;
			// 重置分页和加载状态
			this.resetPagination();
		},
		handleShopType(type) {
			let name = this.categoryOptions.find((item) => type == item.value);
			return name ? name.label : "";
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
		handleOrderType(type){
			let name = this.statusFilters.find((item) => type == item.value);
			return name ? name.label : "";
		},
		async getStatusType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=OrderPageStateEnum");
			console.log("筛选触发内容", res);
			if (res.code == "0000") {
				this.statusFilters =
					res.data.map((item) => {
						return {
							label: item.dictName,
							value: item.dictCode,
						};
					}) || [];
			} else {
				this.statusFilters = [];
			}
		},
		// 获取订单状态对应的样式类
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
		// 重置分页
		resetPagination() {
			this.page = 0;
			this.hasMore = true;
			this.orderList = []
			this.loadMore();
			// 实际项目中这里应该重新获取第一页数据
		},
		async getData(){
			let res = await util.post("/order/pageList", {
				pageNum: this.page,
				pageSize: 10,
				orderStatus: this.activeStatus,
				search: this.searchKeyword,
			});
			this.hasMore = res.data?.total > this.page * 10
			this.loading = false;
			console.log("商户列表", res)
			if(res.code == '0000'){
				this.orderList = [...this.orderList, ...(res.data?.records || [])]
			}
		},
		// 加载更多
		loadMore() {
			console.log("loading");
			if (this.loading || !this.hasMore) return;

			this.loading = true;
			this.page++;
			this.getData();
		},
		// 跳转到订单详情页
		
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
