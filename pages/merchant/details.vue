<template>
	<view class="details-container">
		<!-- 导航栏 - 添加padding-top以适配状态栏，并设置为透明背景 -->
		<nav-bar :bgColor="navBarConfig.bgColor" class="status-bar-nav" :title="navBarConfig.title" />

		<!-- 页面加载提示 -->
		<uni-load-more
			v-if="isLoading"
			:status="'loading'"
			:content-text="{ contentdown: '加载更多', contentrefresh: '加载中...', contentnomore: '没有更多数据' }"
		/>

		<scroll-view scroll-y class="scroll-content" @scroll="handleScroll" :show-scrollbar="false">
			<!-- 店铺图片轮播 - 移到导航栏下方 -->
			<view class="shop-banner">
				<swiper autoplay circular>
					<swiper-item v-for="(img, index) in shopImages" :key="index">
						<image
							:src="img"
							mode="aspectFill"
							class="banner-image"
							@error="onImageError($event, 'banner', index)"
						></image>
					</swiper-item>
				</swiper>
			</view>

			<!-- 商户基本信息 -->
			<view class="merchant-info">
				<view class="info-header">
					<h1 class="shop-name">{{ shopInfo.shopName }}</h1>
					<view class="header-actions" v-if="false">
						<view class="favorite-btn" v-if="shopInfo.discount"> 惠 </view>
						<view class="discount-tag" v-if="shopInfo.discount">
							{{ shopInfo.discount }}
						</view>
					</view>
				</view>

				<view class="rating-row">
					<view class="rating" v-if="shopInfo.rating">
						<text class="rating-score">{{ shopInfo.rating || 0 }}</text>
						<text class="rating-text">分</text>
					</view>
					<view class="separator" v-if="shopInfo.rating"></view>
					<view class="sales-volume">月销{{ formatSales(shopInfo.sales) }}</view>
					<view class="separator"></view>
					<view class="category">{{ shopInfo.shopTypeName }}</view>
				</view>

				<view class="business-hours">
					<text class="label">营业时间：</text>
					<text class="value">{{ shopInfo.businessTime || "暂无时间" }}</text>
				</view>

				<view class="company-name">
					<text class="value">{{ shopInfo.companyName || "--" }}</text>
				</view>

				<view class="address-row" @click="copyAddress">
					<view class="address-box">
						<image src="/static/img/address_icon.png" mode="aspectFill" class="address_icon" />
						<text class="address">{{ shopInfo.address || "未知位置" }}</text>
					</view>
					<text class="distance"
						>{{ shopInfo.distanceMeters ? Number(shopInfo.distanceMeters).toFixed(2) : 0 }}km</text
					>
				</view>
			</view>

			<!-- 商家宣传 -->
			<view class="promotion-section">
				<image
					v-for="(img, index) in promotionImages"
					:key="index"
					:src="img"
					mode="widthFix"
					class="promotion-image"
					@error="onImageError($event, 'promotion', index)"
				></image>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="navigate-btn" @click="navigateToShop"
				><image src="/static/img/daohang_icon.png" mode="aspectFill" class="navigate-icon" /> 导航去这里</view
			>
			<view class="action-buttons" @click="makePhoneCall">
				<image src="/static/img/phone_icons.png" mode="aspectFill" class="phone-icon" />
			</view>
		</view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			// 商户信息
			shopInfo: {},
			// 店铺图片
			shopImages: [],
			// 宣传图片
			promotionImages: [],
			shopId: "",
			// 页面加载状态
			isLoading: false,
			// 默认图片路径
			defaultImages: {
				banner: "/static/img/logo.png",
				product: "/static/img/logo.png",
				avatar: "/static/img/default-avatar.png",
				reviewImage: "/static/img/logo.png",
				productThumb: "/static/img/logo.png",
				promotion: "/static/img/logo.png",
			},
			// 评价相关数据
			reviewStats: {
				totalCount: 128,
				averageScore: 4.2,
			},
			reviewCategories: [
				{ label: "全部", value: "all", count: 128 },
				{ label: "好评", value: "positive", count: 98 },
				{ label: "中评", value: "neutral", count: 18 },
				{ label: "差评", value: "negative", count: 12 },
				{ label: "有图", value: "withImages", count: 45 },
			],
			activeCategory: "all",
			hasMoreReviews: true,
			pageNum: 1,
			pageSize: 4,
			navBarConfig: {
				titleColor: "#FFF",
				title: "",
				bgColor: "rgba(255, 255, 255, 0)",
			},
		};
	},
	computed: {},
	async onLoad(pages) {
		console.log("pages", pages);
		this.shopId = pages.id || "";
		this.getMerchantData();
	},
	methods: {
		async getMerchantData() {
			uni.showLoading({
				title: '加载中',
				mask: true
			})
			let userLocation = uni.getStorageSync("userLocation");
			let res = await util.post("/shop/detail", {
				shopId: this.shopId,
				latitude: userLocation.latitude,
				longitude: userLocation.longitude,
			});
			uni.hideLoading()
			console.log("res---====000", res);
			if (res.code == "0000") {
				this.shopInfo = res.data || {};
				let shopDoorUrl = JSON.parse(res.data.shopDoorUrl || "[]");

				shopDoorUrl.map((item) => {
					this.shopImages.push(item.url);
				}) || [];

				let shopSceneUrl = JSON.parse(res.data.shopSceneUrl || "[]");
				shopSceneUrl.map((item) => {
					this.promotionImages.push(item.url);
				}) || [];
			} else {
				uni.showToast({
					title: res.message || '加载失败，请重试！',
					icon: "none",
					mask: true,
					duration: 2000,
				});
			}
		},
		// 格式化月销显示
		formatSales(sales) {
			const num = parseInt(sales) || 0;
			
			if (num <= 100) {
				return num;
			}
			
			// 计算向下取整的百位数
			const base = Math.floor(num / 100) * 100;
			return `${base}+`;
		},
		handleScroll(e) {
			const scrollTop = e.detail.scrollTop;
			const threshold = 15;
			let opacity = scrollTop / threshold;
			opacity = Math.min(opacity, 1);

			this.navBarConfig.bgColor = `rgba(255, 255, 255, ${opacity})`;

			if (scrollTop >= threshold) {
				this.navBarConfig.title = "商家详情";
				this.navBarConfig.titleColor = "#000";
			} else {
				this.navBarConfig.title = "";
				this.navBarConfig.titleColor = "#FFF";
			}
		},
		// 拨打电话
		makePhoneCall() {
			uni.makePhoneCall({
				phoneNumber: this.shopInfo.phone,
				success: function () {
					console.log("拨打电话成功");
				},
				fail: function () {
					console.log("拨打电话失败");
				},
			});
		},
		// 导航到店铺
		navigateToShop() {
			uni.openLocation({
				latitude: this.shopInfo.latitude,
				longitude: this.shopInfo.longitude,
				name: this.shopInfo.shopName,
				address: this.shopInfo.address,
				success: function () {
					console.log("打开地图成功");
				},
				fail: function () {
					uni.showToast({
						icon: "none",
						title: "暂无商家位置信息",
						duration: 1000,
					});
					console.log("打开地图失败");
				},
			});
		},

		// 复制地址
		copyAddress() {
			uni.setClipboardData({
				data: this.shopInfo.address,
				success: () => {
					uni.showToast({
						title: "地址已复制",
						icon: "success",
						duration: 1500,
					});
				},
			});
		},

		previewImage(current, urls) {
			// 预览评价图片
			uni.previewImage({
				current: current,
				urls: urls,
			});
		},

		// 图片加载错误处理
		onImageError(event, type, index) {
			const defaultSrc = this.defaultImages[type] || "/static/img/logo.png";

			if (event.mp && event.mp.target) {
				event.mp.target.src = defaultSrc;
			}

			// 如果是特定索引的图片，保存默认图片到对应数据中
			if (type === "banner" && index !== undefined) {
				this.$set(this.shopImages, index, defaultSrc);
			} else if (type === "product" && index !== undefined) {
				if (this.products[index]) {
					this.$set(this.products[index], "image", defaultSrc);
				}
			} else if (type === "promotion" && index !== undefined) {
				this.$set(this.promotionImages, index, defaultSrc);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./details.scss";
</style>
