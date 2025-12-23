<template>
	<view class="order-contain">
		<!-- 导航栏 -->
		<view class="top-box">
			<nav-bar bgColor="#FFF" title="商户列表" :is-back="false" />
			<!-- 搜索区域 -->
			<view class="search-section">
				<view class="search-box">
					<input class="search-input" placeholder="请输入关键字搜索" v-model="searchKeyword" />
					<view class="search-icon" @click="searchShop">
						<u-icon name="search" size="32" color="#FFFFFF" />
					</view>
				</view>

				<!-- 筛选区域 -->
				<view class="filter-section">
					<u-dropdown class="u-dropdown">
						<u-dropdown-item
						v-model="regionValue"
						title="区域"
						:options="regionOptions"
						@change="regionChange"
						height="750"
					></u-dropdown-item>
					<u-dropdown-item
						v-model="categoryValue"
						title="分类"
						:options="categoryOptions"
						@change="categoryChange"
						height="750"
					></u-dropdown-item>
					<u-dropdown-item
						v-model="sortValue"
						title="排序"
						:options="sortOptions"
						@change="sortChange"
						height="750"
					></u-dropdown-item>
					</u-dropdown>
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
			<view
				v-for="item in orderList"
				:key="item.shopId"
				class="merchant-card"
				@click="navigateToOrderDetail(item.shopId)"
			>
				<!-- 商户卡片 -->
				<view class="merchant-content">
					<view class="store-image">
						<image :src="handleImg(item.shopDoorUrl)" mode="aspectFill" />
					</view>
					<view class="merchant-info">
						<view class="merchant-header">
							<text class="store-name">{{ item.shopName }}</text>
							<view class="phone-icon" @click.stop="makePhoneCall(item.phone)">
								<image src="/static/img/phone_icons.png" mode="aspectFill" />
							</view>
						</view>

						<view class="merchant-stats">
							<text class="rating" v-if="item.rating">{{ item.rating || 0 }}分</text>
							<text class="separator" v-if="item.rating">|</text>
							<text class="sales">月销{{ formatSales(item.sales) }}</text>
							<text class="separator">|</text>
							<text class="category">{{ handleShopType(item.shopType) || "未知分类" }}</text>
						</view>

						<view class="merchant-detail">
							<text class="business-time">营业时间</text>
							<view>
								<view v-for="(times, index) in formatTime(item.businessTime)" :key="index">{{times}}</view>
							</view>
						</view>

						<view class="merchant-detail">
							<text class="company-name">{{ item.companyName || "--" }}</text>
						</view>
					</view>
				</view>
				<view class="merchant-footer">
					<view class="address">
						<image src="/static/img/address_icon.png" mode="aspectFill" class="address-icon" />
						<text class="address-text">{{ item.address || "未知位置" }}</text>
					</view>
					<view class="distance-tag" @click.stop="openLocation(item)">
						<image src="/static/img/navigation_icons.png" mode="aspectFill" class="distance-icon" />
						<text class="distance-text">{{ Number(item.distanceMeters).toFixed(2) || 0 }}km</text>
					</view>
				</view>
			</view>

			<!-- 空状态提示 -->
			<view v-if="orderList.length === 0" class="empty-state">
				<u-empty mode="order" text="暂无商家"> </u-empty>
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
		<Tabbar :activeIndex="0" />
	</view>
</template>

<script>
import Tabbar from "../../components/Tabbar/TabBar.vue";
import util from "@/common/util.js";
export default {
	components: {
		Tabbar,
	},
	data() {
		return {
			searchKeyword: "",
			scrollTop: 0,
			page: 0,
			pageSize: 10,
			loading: false,
			hasMore: true,
			// 筛选值
			regionValue: "",
			categoryValue: "",
			sortValue: "",
			// 区域选项
			regionOptions: [],
			// 分类选项
			categoryOptions: [],
			// 排序选项
			sortOptions: [],
			orderList: [],
		};
	},
	async onShow() {
		uni.showLoading({
			title: "加载中",
			mask: true,
		});
		// 先获取位置信息，再加载其他数据
		await this.getLocationFirst();

		// 无论是否获取到位置信息，都继续加载其他数据
		await this.getDistanceType();
		await this.getShopType();
		await this.getShopOrderTypeEnum();

		// 重置分页并加载数据
		this.resetPagination();
	},
	mounted() {
		// this.getData()
	},
	methods: {
		formatTime(time){
			if(!time) return ['暂无时间']
			console.log('获取时间', time.split(","), time)
			return time.split(",")
		},
		searchShop() {
			this.resetPagination();
		},
		// 优先获取位置信息，如果失败则继续执行
		async getLocationFirst() {
			return new Promise((resolve) => {
				console.log("开始获取当前位置信息");

				// 检查是否支持获取位置信息
				uni.getSystemInfo({
					success: (res) => {
						console.log("系统信息:", res);

						// 获取位置权限
						uni.getSetting({
							success: (settingRes) => {
								console.log("权限设置:", settingRes);

								// 检查是否有位置权限
								if (settingRes.authSetting["scope.userLocation"] === false) {
									// 用户拒绝过位置权限，不强制要求，继续执行
									console.log("用户拒绝位置权限，继续执行后续逻辑");
									resolve();
									return;
								}

								// 获取当前位置
								this.getCurrentLocationForFirst(resolve);
							},
							fail: (err) => {
								console.error("获取权限设置失败:", err);
								// 权限获取失败，继续执行后续逻辑
								resolve();
							},
						});
					},
					fail: (err) => {
						console.error("获取系统信息失败:", err);
						// 系统信息获取失败，继续执行后续逻辑
						resolve();
					},
				});
			});
		},

		// 为首次加载获取当前位置
		getCurrentLocationForFirst(resolve) {
			uni.getLocation({
				type: "gcj02", // 使用国测局坐标系
				altitude: true, // 获取海拔信息
				success: (res) => {
					console.log("获取位置成功:", res);

					const locationData = {
						latitude: res.latitude,
						longitude: res.longitude,
						accuracy: res.accuracy,
						altitude: res.altitude,
						speed: res.speed,
						timestamp: new Date().getTime(),
					};

					// 保存位置信息到本地存储
					uni.setStorageSync("userLocation", locationData);
					resolve();
				},
				fail: (err) => {
					console.error("获取位置失败:", err);
					// 获取位置失败，继续执行后续逻辑
					this.getLocationError();
					resolve();
				},
			});
		},
		getLocalData() {
			console.log("开始获取当前位置信息");

			// 检查是否支持获取位置信息
			uni.getSystemInfo({
				success: (res) => {
					console.log("系统信息:", res);

					// 获取位置权限
					uni.getSetting({
						success: (settingRes) => {
							console.log("权限设置:", settingRes);

							// 检查是否有位置权限
							if (settingRes.authSetting["scope.userLocation"] === false) {
								// 用户拒绝过位置权限，引导用户开启
								uni.showModal({
									title: "位置权限",
									content: "需要获取您的位置信息来提供更好的服务，请在设置中开启位置权限",
									confirmText: "去设置",
									success: (modalRes) => {
										if (modalRes.confirm) {
											uni.openSetting();
										}
									},
								});
								return;
							}

							// 获取当前位置
							this.getCurrentLocation();
						},
						fail: (err) => {
							console.error("获取权限设置失败:", err);
							this.getLocationError();
						},
					});
				},
				fail: (err) => {
					console.error("获取系统信息失败:", err);
					this.getLocationError();
				},
			});
		},

		// 获取当前位置
		getCurrentLocation() {
			uni.getLocation({
				type: "gcj02", // 使用国测局坐标系
				altitude: true, // 获取海拔信息
				success: (res) => {
					console.log("获取位置成功:", res);

					const locationData = {
						latitude: res.latitude,
						longitude: res.longitude,
						accuracy: res.accuracy,
						altitude: res.altitude,
						speed: res.speed,
						timestamp: new Date().getTime(),
					};

					// 保存位置信息到本地存储
					uni.setStorageSync("userLocation", locationData);

					// 可以在这里调用其他需要位置信息的方法
					// 例如：更新商户列表，计算距离等
					this.updateDataWithLocation(locationData);
				},
				fail: (err) => {
					console.log("获取位置失败:", err);
					this.getLocationError();
				},
			});
		},

		// 处理获取位置失败的情况
		getLocationError() {
			console.log("获取位置失败-----");
			uni.showModal({
				title: "获取位置失败",
				content: "无法获取您的位置信息，部分功能可能受限",
				confirmText: "重试",
				cancelText: "取消",
				success: (res) => {
					if (res.confirm) {
						// 重试获取位置
						this.getLocalData();
					} else {
						// 使用默认位置或跳过位置相关功能
						console.log("用户取消获取位置");
						uni.showToast({
							title: "用户取消获取位置",
							icon: "none",
							duration: 2000,
						});
						// 设置默认位置
						// this.handleNoLocation();
					}
				},
				fail: (err) => {
					console.error("获取位置失败", err);
					uni.showToast({
						title: "获取位置失败",
						icon: "error",
						duration: 2000,
					});
				},
			});
		},

		// 处理没有位置信息的情况
		handleNoLocation() {
			// 可以设置默认位置或跳过位置相关功能
			console.log("使用默认位置或跳过位置相关功能");

			// 示例：设置默认位置（北京天安门）
			const defaultLocation = {
				latitude: 39.908823,
				longitude: 116.39747,
				isDefault: true,
			};

			uni.setStorageSync("userLocation", defaultLocation);

			// 继续执行其他逻辑
			this.updateDataWithLocation(defaultLocation);
		},

		// 使用位置信息更新数据
		updateDataWithLocation(locationData) {
			console.log("使用位置信息更新数据:", locationData);

			// 在这里可以根据位置信息更新商户列表
			// 例如：重新获取商户数据，计算距离等
			this.getData();
		},
		// 区域筛选变化
		regionChange(value) {
			this.regionValue = value;
			// 重置分页和加载状态
			this.resetPagination();
		},
		// 分类筛选变化
		categoryChange(value) {
			this.categoryValue = value;
			// 重置分页和加载状态
			this.resetPagination();
		},
		// 排序方式变化
		sortChange(value) {
			this.sortValue = value;
			// 重置分页和加载状态
			this.resetPagination();
		},

		async getDistanceType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=ShopOrderDistanceEnum");
			console.log("getDistanceType", res);
			if (res.code == "0000") {
				this.regionOptions =
					res.data.map((item) => {
						return {
							label: item.dictName,
							value: item.dictCode,
						};
					}) || [];
				this.regionValue = this.regionOptions[0].value;
			} else {
				this.regionOptions = [];
			}
		},
		handleShopType(type) {
			let name = this.categoryOptions.find((item) => type == item.value);
			return name ? name.label : "";
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
		async getShopType() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=ShopOrderShopTypeEnum");
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
		async getShopOrderTypeEnum() {
			let res = await util.get("/sysParam/getParam?dictTypeCode=ShopOrderTypeEnum");
			console.log("getShopOrderTypeEnum", res);
			if (res.code == "0000") {
				this.sortOptions =
					res.data.map((item) => {
						return {
							label: item.dictName,
							value: item.dictCode,
						};
					}) || [];
				this.sortValue = this.sortOptions[0].value;
				console.log("sortValue---11", this.sortValue);
			} else {
				this.sortOptions = [];
			}
		},
		// 重置分页
		resetPagination() {
			this.page = 0;
			this.hasMore = true;
			this.orderList = [];
			this.loadMore();
			// 实际项目中这里应该重新获取第一页数据
		},
		handleImg(img) {
			let url = JSON.parse(img || "[]");
			console.log("img------", img, url);
			return url[0]?.url;
		},
		getData() {
			this.loading = true;
			console.log("sortValue----2", this.sortValue);
			// 获取用户位置信息
			const userLocation = uni.getStorageSync("userLocation");
			const requestData = {
				pageSize: 10,
				pageNum: this.page,
				shopType: this.categoryValue,
				distance: this.regionValue,
				orderType: this.sortValue,
				search: this.searchKeyword,
			};

			// 如果有位置信息，添加到请求参数中
			if (userLocation && userLocation.latitude && userLocation.longitude) {
				requestData.latitude = userLocation.latitude;
				requestData.longitude = userLocation.longitude;
				console.log("请求商户列表，包含位置信息:", userLocation);
			} else {
				console.log("请求商户列表，无位置信息");
			}

			util.post("/shop/pageList", requestData)
				.then((res) => {
					this.hasMore = res.data?.total > this.page * 10;
					this.loading = false;
					uni.hideLoading();
					console.log("商户列表", res);
					if (res.code == "0000") {
						// 如果有位置信息，计算每个商户的距离
						if (userLocation && userLocation.latitude && userLocation.longitude) {
							const updatedList = (res.data?.records || []).map((item) => {
								if (item.latitude && item.longitude) {
									// 计算距离（单位：千米）
									const distance = this.getDistance(
										userLocation.latitude,
										userLocation.longitude,
										parseFloat(item.latitude),
										parseFloat(item.longitude)
									);
									return {
										...item,
										distanceMeters: distance,
									};
								}
								return item;
							});
							this.orderList = [...this.orderList, ...updatedList];
						} else {
							this.orderList = [...this.orderList, ...(res.data?.records || [])];
						}
					} else {
						this.loading = false;
						uni.hideLoading();
						uni.showToast({
							title: res.message || "获取商户信息失败，请检查权限",
							icon: "none",
						});
					}
				})
				.catch((err) => {
					this.loading = false;
					uni.hideLoading();
					console.error("获取商户列表失败:", err);
					uni.showToast({
						title: "获取商户列表失败",
						icon: "none",
					});
				});
		},

		// 使用Haversine公式计算两点之间的距离（单位：千米）
		getDistance(lat1, lng1, lat2, lng2) {
			const radLat1 = (lat1 * Math.PI) / 180.0;
			const radLat2 = (lat2 * Math.PI) / 180.0;
			const a = radLat1 - radLat2;
			const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;

			let s =
				2 *
				Math.asin(
					Math.sqrt(
						Math.pow(Math.sin(a / 2), 2) +
							Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
					)
				);
			s = s * 6378.137; // 地球半径
			s = Math.round(s * 100) / 100; // 保留两位小数

			return s;
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
		navigateToOrderDetail(orderId) {
			console.log("shopId", orderId);
			uni.navigateTo({
				url: `/pages/merchant/details?id=${orderId}`,
			});
		},
		// 拨打电话
		makePhoneCall(phoneNumber) {
			if (!phoneNumber) {
				uni.showToast({
					title: "暂无电话号码",
					icon: "none",
				});
				return;
			}

			uni.makePhoneCall({
				phoneNumber: phoneNumber,
				success: () => {
					console.log("拨打电话成功");
				},
				fail: (err) => {
					console.error("拨打电话失败", err);
					uni.showToast({
						title: "拨打电话失败",
						icon: "none",
					});
				},
			});
		},
		// 打开地图位置
		openLocation(item) {
			if (!item.latitude || !item.longitude) {
				uni.showToast({
					title: "暂无位置信息",
					icon: "none",
				});
				return;
			}

			uni.openLocation({
				latitude: parseFloat(item.latitude),
				longitude: parseFloat(item.longitude),
				name: item.storeName,
				address: item.address || "商户地址",
				success: () => {
					console.log("打开地图成功");
				},
				fail: (err) => {
					console.error("打开地图失败", err);
					uni.showToast({
						title: "打开地图失败",
						icon: "none",
					});
				},
			});
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./list.scss";
</style>
