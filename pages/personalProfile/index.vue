<template>
	<view class="personal-profile-container">
		<nav-bar bgColor="#FFF" title="个人资料" />

		<view class="user_info_box">
			<!-- 头像上传区域 -->
			<view class="avatar-section">
				<view class="avatar-container">
					<image :src="userInfo.avatar" class="avatar" mode="aspectFill"></image>
					<view class="avatar-upload-btn" @click="chooseAvatar">
						<!-- <image src="/static/img/camera-icon.png" class="camera-icon" mode="aspectFit"></image> -->
						<u-icon name="camera-fill" size="40"></u-icon>
					</view>
				</view>
			</view>

			<!-- 用户信息表单区域 -->
			<view class="info-form-section">
				<view class="form-item">
					<text class="form-label">昵称</text>
					<input v-model="userInfo.customerName" class="form-input" placeholder="请输入昵称" />
				</view>

				<view class="form-item">
					<text class="form-label">手机号</text>
					<text class="form-value phone">{{ userInfo.mobileDecrypt }}</text>
				</view>

				<view class="form-item" @click="chooseGender">
					<text class="form-label">性别</text>
					<view class="sex-container">
						<text class="form-value">{{ userInfo.gender || "未知" }}</text>
						<!-- <view class="arrow-icon"></view> -->
						<u-icon size="28" class="right-icon" name="arrow-right" color="#999"></u-icon>
					</view>
				</view>
			</view>
		</view>

		<view class="confirm-btn" @click="submitForm">保存</view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			userInfo: {
				avatar: "",
				customerName: "",
				sex: "3",
				gender: "未知",
				mobileDecrypt: "",
			},
		};
	},
	onShow() {
		
		this.getUserInfo();
	},
	methods: {
		getUserInfo() {
			let userInfo = uni.getStorageSync("userInfo");
			console.log("改变参数内容----->>>>", userInfo?.mobileDecrypt);
			console.log("改变参数内容userInfo----->>>>", userInfo);
			this.userInfo = {
				avatar: userInfo?.avatar || "",
				customerName: userInfo?.customerName || userInfo?.userName || "",
				sex: userInfo?.sex || "3",
				mobileDecrypt: userInfo?.mobileDecrypt || "",
			};
			let obj = {
				1: "男",
				2: "女",
				3: "未知",
			};
			this.userInfo.gender = obj[userInfo?.sex];
		},
		// 选择头像
		chooseAvatar() {
			let _this = this;
			uni.chooseImage({
				count: 1,
				sizeType: ["original", "compressed"],
				sourceType: ["album", "camera"],
				success: async (res) => {
					console.log(res);
					const tempFilePath = res.tempFilePaths[0];

					try {
						// 使用util.uploadFile方法上传图片
						const uploadResult = await util.uploadFile(tempFilePath);
						console.log("上传结果:", uploadResult);

						if (uploadResult.code == "0000") {
							// 上传成功，更新头像
							_this.userInfo.avatar = uploadResult.data?.fileUrl;
							this.$forceUpdate();
							console.log("上传成功:", uploadResult.data?.fileUrl);
							uni.showToast({
								title: "头像上传成功",
								icon: "success",
							});
						} else {
							uni.showToast({
								title: uploadResult.message || "上传失败",
								icon: "none",
							});
						}
					} catch (error) {
						console.error("上传头像失败:", error);
						uni.showToast({
							title: "上传失败，请重试",
							icon: "none",
						});
					}
				},
				fail: (err) => {
					console.error("选择图片失败:", err);
					// uni.showToast({
					// 	title: "选择图片失败",
					// 	icon: "none",
					// });
				},
			});
		},

		// 选择性别
		chooseGender() {
			uni.showActionSheet({
				itemList: ["男", "女"],
				success: (res) => {
					console.log("chooseGender", res);
					if (!res.cancel) {
						this.userInfo.sex = res.tapIndex + 1;
						let obj = {
							0: "男",
							1: "女",
							2: "未知",
						};
						this.userInfo.gender = obj[res.tapIndex] || "未知";
						this.$forceUpdate();
					}
				},
			});
		},

		// 提交表单
		async submitForm() {
			// 表单验证
			if (!this.userInfo.customerName || this.userInfo.customerName.trim() === "") {
				uni.showToast({
					title: "昵称不能为空",
					icon: "none",
				});
				return;
			}

			// 模拟提交数据到服务器
			console.log("提交用户信息:", this.userInfo);
			let payload = {
				avatar: this.userInfo.avatar,
				customerName: this.userInfo.customerName,
				sex: this.userInfo.sex,
			};
			// 模拟网络请求延迟
			uni.showLoading({
				title: "正在提交",
			});
			let res = await util.post("/customer/updateUserInfo", payload);
			// 模拟API调用
			uni.hideLoading();
			// 保存成功后提示用户并返回上一页
			if (res.code == "0000") {
				uni.showToast({
					title: "保存成功",
					icon: "success",
					complete: () => {
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					},
				});
			} else {
				uni.showToast({
					title: res.message || "保存失败",
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
