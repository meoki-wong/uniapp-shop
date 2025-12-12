<template>
	<view class="nav-bar-contain">
		<u-navbar
			:back-icon-name="isShowHomeIcon ? 'home-fill' : 'nav-back'"
			:back-icon-color="backIconColor"
			:is-back="isBack"
			:title="title"
			:background="background"
			:is-fixed="true"
			:border-bottom="borderBottom"
			:title-color="titleColor"	
			:title-size="titleSize"
			:custom-back="handleBack"
		></u-navbar>
	</view>
</template>
nav
<script>
export default {
	props: {
		bgColor: {
			type: String,
			default: "#001f3f",
		},
		isShowHomeIcon: {
			type: Boolean,
			default: false,
		},
		backIconColor: {
			type: String,
			default: "#000",

		},
		opacity: {
			type: Boolean,
			default: false,
		},
		isBack: {
			type: Boolean,
			default: true,
		},
		title: {
			type: String,
			default: "",
		},
		borderBottom: {
			type: Boolean,
			default: false,
		},
		titleColor: {
			type: String,
			default: "#000",
		},
		titleSize: {
			type: [Number, String],
			default: 34,
		},
	},
	watch: {
		bgColor(newVal) {
			this.background.backgroundColor = this.opacity ? "rgba(0,0,0,0)" : newVal
		},
		opacity(newVal){
			this.background.backgroundColor = this.opacity ? "rgba(0,0,0,0)" : this.bgColor || "#001f3f"
		}
	},
	data() {
		return {
			background: {
				backgroundColor: this.opacity ? "rgba(0,0,0,0)" : this.bgColor || "#001f3f",
			},
		};
	},
	methods: {
		handleBack() {
			if(this.isShowHomeIcon){
				uni.reLaunch({
					url: '/pages/home/list'
				})
			} else {
				uni.navigateBack()
			}
		},
	},
};
</script>

<style lang="less" scoped>
@import "./Navbar.module.less";
</style>
