<template>
	<view>
		<nav-bar :title="title" bgColor="#fff"></nav-bar>
		<u-parse class="parse_style" :html="detail"></u-parse>
	</view>
</template>

<script>
import { str } from "./protocol/user_privacy_policy/index";
import { strs } from "./protocol/mall_user_policy/index";
export default {
	data() {
		return {
			detail: "",
			title: "用户隐私政策",
		};
	},
	onLoad(options) {
		if (options.type == 1) {
			this.detail = str;
			this.title = "用户隐私政策";
		} else {
			this.detail = strs;
			this.title = "商城用户协议";
		}
	},
};
</script>

<style lang="scss" scoped>
.parse_style {
	padding-top: 88rpx;
}
</style>
