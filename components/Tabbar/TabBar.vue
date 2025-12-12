<template>
	<view class="tab-contain">
		<ul>
			<li
				v-for="(item, index) in list"
				:key="index"
		tabbar		:class="item.customIcon ? 'custom-item' : item.placeholder ? 'placeholder-item' : ''"
				@tap="changeNavItem(item, index)"
			>
				<image
					:src="activeIndex == index ? item.selectedIconPath : item.iconPath"
					mode="aspectFit"
					v-if="!item.placeholder"
				/>
				<view v-if="!item.placeholder" :style="activeIndex == index ? 'color:#F63D10' : ''">{{
					item.text
				}}</view>
			</li>
		</ul>tabbar
	</view>
</template>

<script>
export default {
	props: {
		activeIndex: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			list: [
				{
					iconPath: require("./assets/home.svg"),
					selectedIconPath: require("./assets/home_select.png"),
					text: "首页",
					customIcon: false,
					pagePath: "/pages/home/list",
				},
				{
					// 中间圆形按钮
					iconPath: require("./assets/scan_icon.png"),
					selectedIconPath: require("./assets/scan_icon.png"),
					text: "",
					customIcon: true,
					pagePath: "",
				},
				{
					// 占位项，保持布局平衡
					placeholder: true,
					text: "",
				},
				{
					iconPath: require("./assets/mine_unselect.png"),
					selectedIconPath: require("./assets/mine_active.svg"),
					text: "我的",
					customIcon: false,
					pagePath: "/pages/mine/index",
				},
			],
		};
	},
	methods: {
		changeNavItem(item, index) {
			// 跳过占位项
			if (item.placeholder) return;

			// 处理扫码按钮（索引为1的中间圆形按钮）
			if (index === 1) {
				// 调用uni-app的扫码API
				uni.scanCode({
					onlyFromCamera: false, // 仅从相机扫码
					scanType: ["qrCode"], // 支持的扫码类型
					success: (res) => {
						// 扫码成功后跳转到扫码支付页面
						uni.navigateTo({
							url: "/pages/scanToPay/index?code=" + encodeURIComponent(res.result),
						});
					},
					fail: (err) => {
						// 扫码失败处理
						console.error("扫码失败:", err);
					},
					complete: () => {
						// 无论成功失败都会执行的逻辑
					},
				});
			} else {
				// 其他普通标签页使用switchTab跳转
				uni.switchTab({
					url: item.pagePath,
					success: () => {
						uni.hideTabBar(); // 在跳转成功后隐藏
					},
				});
			}
		},
	},
};
</script>
<style lang="less" secoped>
@import "./TabBar.module.less";
</style>
