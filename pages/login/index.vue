<template>
	<view class="login-contain">
		<nav-bar bgColor="#FFF" />
		<view class="bg-contain">
			<!-- 使用image标签替代背景图片，符合微信小程序规范 -->
			<image src="/static/img/login_bg.png" mode="aspectFill" class="bg-image"></image>
			<image src="/static/img/logo.png" mode="aspectFit" class="logo_image" />
			<view class="login_tips">发 现 太 多 好 去 处</view>
		</view>
		<button class="login_btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
			<image class="login_wx_icon" src="/static/img/login_wx_icon.png" mode="aspectFit" /> 微信登录
		</button>
		<view class="login_agreement"
			>登录即表示您同意<view class="agm_light" @click="goProtocol(2)">《服务协议》</view>和<view
				class="agm_light"
				@click="goProtocol(1)"
				>《隐私政策》</view
			></view
		>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	methods: {
		goProtocol(type) {
			uni.navigateTo({
				url: `/pages/protocol/index?type=${type}`,
			});
		},
		// 获取手机号回调
		getPhoneNumber(e) {
			console.log("获取手机号事件：", e);
			// let wxLoginCode = uni.getStorageSync("wxLoginCode");
			if (e.detail.errMsg === "getPhoneNumber:ok") {
				// 用户同意授权
				const code = e.detail.code;
				console.log("获取到手机号授权码：", e);
				// 跳转到realNameAuth
				// uni.navigateTo({
				// 	url: '/pages/realNameAuth/index?code=' + code
				// });

				// 这里可以调用后端接口，使用code换取用户手机号
				// 示例：
				uni.login({
					provider: "weixin",
					success: function (loginRes) {
						util.post("/wxminiLogin", { openIdCode: loginRes.code, phoneCode: code })
							.then((res) => {
								console.log("获取登录信息", res);
								// 登录成功后的处理
								if (res.code == "0000") {
									uni.showToast({
										title: "登录成功",
										icon: "success",
									});
									uni.setStorageSync("token", res.data?.token);
									uni.switchTab({
										url: "/pages/home/list?code=" + code,
										success: () => {
											console.log("跳转成功");
											uni.hideTabBar(); // 在跳转成功后隐藏
										},
									});
								} else {
									uni.showToast({
										title: "登录失败",
										icon: "error",
									});
								}

								// 保存用户信息，跳转到首页等
							})
							.catch((err) => {
								console.log("获取登录信息时间", err);
								uni.showToast({
									title: "登录失败",
									icon: "none",
								});
							});
					},
					fail(err) {
						uni.showToast({
							title: "登录失败",
							icon: "none",
						});
					},
				});
			} else {
				// 用户拒绝授权
				console.log("用户拒绝授权");
				uni.showToast({
					title: "您已拒绝授权",
					icon: "none",
				});
			}
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
