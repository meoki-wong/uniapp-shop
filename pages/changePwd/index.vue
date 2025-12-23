<template>
	<view class="real-name-contain">
		<nav-bar bgColor="#FFF" title="修改密码" />

		<view class="show-bio" v-if="biometricSupported">
			<view class="bio-select-box">
				<text class="bio-title">指纹/人脸识别</text>
				<u-switch v-model="checked" size="38" active-color="#f63d10"></u-switch>
			</view>
			<view class="title">支付密码设置</view>
		</view>
		<!-- place_holder -->
		<view class="form-container" :class="{ 'place_holder': !biometricSupported }">
			<u-form :model="form" ref="uForm" :rules="rules">
				<u-form-item label="手机号" prop="phone" label-width="150">
					<u-input v-model="form.phone" placeholder="请输入手机号码" disabled />
				</u-form-item>

				<u-form-item label="验证码" prop="code" label-width="150" class="code-form-item">
					<view class="msg-box">
						<u-input v-model="form.code" placeholder="请输入" class="code-input" />
						<view :class="['code-btn', { disabled: codeDisabled }]" @click.stop="getCode">
							{{ codeText }}
						</view>
					</view>
				</u-form-item>

				<u-form-item label="设置密码" prop="password" label-width="150">
					<u-input v-model="form.password" type="password" placeholder="请输入6位数字密码" maxlength="6" />
				</u-form-item>

				<u-form-item class="no-border" label="确认密码" prop="passwordEnc" label-width="150">
					<u-input v-model="form.passwordEnc" type="password" placeholder="请再次输入密码" maxlength="6" />
				</u-form-item>
			</u-form>
		</view>

		<view class="confirm-btn" @click="submitForm">确认</view>
	</view>
</template>

<script>
import util from "@/common/util.js";
export default {
	data() {
		return {
			checked: false,
			form: {
				name: "",
				phone: "",
				code: "",
				password: "",
				passwordEnc: "",
			},
			rules: {
				name: [
					{
						required: true,
						message: "请输入姓名",
						trigger: "blur",
					},
				],
				phone: [
					{
						required: true,
						message: "请输入手机号",
						trigger: "blur",
					},
					{
						pattern: /^1[3-9]\d{9}$/,
						message: "请输入正确的手机号",
						trigger: "blur",
					},
				],
				code: [
					{
						required: true,
						message: "请输入验证码",
						trigger: "blur",
					},
				],
				password: [
					{
						required: true,
						message: "请输入密码",
						trigger: "blur",
					},
					{
						len: 6,
						message: "密码长度必须为6位",
						trigger: "blur",
					},
					{
						pattern: /^\d{6}$/,
						message: "密码必须为6位数字",
						trigger: "blur",
					},
				],
				passwordEnc: [
					{
						required: true,
						message: "请再次输入密码",
						trigger: ["blur", "change"],
					},
					{
						validator: function(rule, value, callback) {
							console.log("--00--", this.form.password, value);
							if (value !== this.form.password) {
								callback(new Error("两次输入的密码不一致"));
							} else {
								callback();
							}
						},
						trigger: ["blur", "change"],
					},
				],
			},
			codeText: "获取验证码",
			codeDisabled: false,
			countdown: 60,
		};
	},
	computed: {
		// 检查设备是否支持生物支付
		biometricSupported() {
			const biometricSupport = uni.getStorageSync("biometricSupport");
			return biometricSupport && biometricSupport.supported;
		}
	},
	mounted() {
		this.getPhoneNumber();
		// 从storage中获取用户信息，设置支付方式
		const userInfo = uni.getStorageSync("userInfo");
		if (userInfo && userInfo.defaultPayWay) {
			// "1"表示不是生物支付，"2"表示是生物支付
			this.checked = userInfo.defaultPayWay === "2";
		}
		console.log("修改密码---->看这里", this.form.phone);
	},
	methods: {
		getPhoneNumber() {
			let userInfo = uni.getStorageSync("userInfo");
			this.form.phone = userInfo?.mobileDecrypt;
			this.$forceUpdate();
		},
		// 获取验证码
		async getCode() {
			// 如果按钮处于禁用状态，直接返回
			if (this.codeDisabled) {
				return;
			}

			if (!this.form.phone) {
				this.$u.toast("请先输入手机号");
				return;
			}

			// if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
			// 	this.$u.toast("请输入正确的手机号");
			// 	return;
			// }

			// 这里应该调用获取验证码的API

			let res = await util.get("/sms/sendSms");
			if (res.code == "0000") {
				this.$u.toast("验证码已发送");
				this.codeDisabled = true;
				this.countdown = 60;
				let _this = this;
				const timer = setInterval(() => {
					_this.countdown--;
					_this.codeText = `${_this.countdown}s后重新获取`;

					if (_this.countdown <= 0) {
						clearInterval(timer);
						_this.codeText = "获取验证码";
						_this.codeDisabled = false;
					}
				}, 1000);
			}
			// 开始倒计时
		},

		// 提交表单
		submitForm() {
			// 检查设备是否支持生物支付
			const biometricSupport = uni.getStorageSync("biometricSupport");
			const isBiometricSupported = biometricSupport && biometricSupport.supported;
			
			// 检查用户是否已经设置了支付密码
			const userInfo = uni.getStorageSync("userInfo");
			const hasPayPass = userInfo && userInfo.hasPayPass;
			
			// 如果设备支持生物支付，且用户已经设置了支付密码，但表单中的密码为空或再次输入为空
			if (isBiometricSupported  && (!this.form.password && !this.form.passwordEnc)) {
				// 只更新支付方式，不更新密码
				const formData = {
					// 添加支付方式参数：1表示没开启生物支付，2表示开启生物支付
					payWay: this.checked ? "2" : "1"
				};
				
				uni.showLoading({
					title: "加载中",
					mask: true,
				});
				
				util.post(`/customer/updateUserPayWay`, formData)
					.then((res) => {
						uni.hideLoading();
						if (res.code == "0000") {
							// 更新本地存储的userInfo中的defaultPayWay
							if (userInfo) {
								userInfo.defaultPayWay = this.checked ? "2" : "1";
								uni.setStorageSync("userInfo", userInfo);
							}
							
							uni.showToast({
								title: "修改成功",
								icon: "success",
								mask: true,
								duration: 1000,
							});
							// 跳转到其他页面或执行其他操作
							setTimeout(() => {
								uni.navigateBack();
							}, 1000);
						} else {
							uni.showToast({
								title: res.message || "修改失败",
								icon: "none",
								mask: true,
							});
						}
					})
					.catch((err) => {
						console.error("修改支付方式请求失败:", err);
						uni.showToast({
							title: "网络错误，请稍后重试",
							icon: "none",
							mask: true,
						});
					});
				return;
			}
			
			// 手动检查密码一致性
			if (this.form.password !== this.form.passwordEnc) {
				this.$u.toast("两次输入的密码不一致");
				return;
			}
			
			this.$refs.uForm.validate((valid) => {
				if (valid) {
					// 表单验证通过，准备提交数据
					const formData = {
						password: this.form.password,
						passwordEnc: this.form.passwordEnc,
						code: this.form.code,
						// 添加支付方式参数：1表示没开启生物支付，2表示开启生物支付
						defaultPayWay: this.checked ? "2" : "1"
					};
					uni.showLoading({
						title: "加载中",
						mask: true,
					});
					util.post(`/customer/updateUserPayPassword`, formData)
						.then((res) => {
							uni.hideLoading();
							if (res.code == "0000") {
								// 更新本地存储的userInfo中的defaultPayWay
								const userInfo = uni.getStorageSync("userInfo");
								if (userInfo) {
									userInfo.defaultPayWay = this.checked ? "2" : "1";
									userInfo.hasPayPass = true; // 标记已设置支付密码
									uni.setStorageSync("userInfo", userInfo);
								}
								
								uni.showToast({
									title: "修改成功",
									icon: "success",
									mask: true,
									duration: 1000,
								});
								// 跳转到其他页面或执行其他操作
								setTimeout(() => {
									uni.navigateBack();
								}, 1000);
							} else {
								uni.showToast({
									title: res.message || "修改失败",
									icon: "none",
									mask: true,
								});
							}
						})
						.catch((err) => {
							console.error("修改密码请求失败:", err);
							uni.showToast({
								title: "网络错误，请稍后重试",
								icon: "none",
								mask: true,
							});
						});
				} else {
					uni.showToast({
						title: "请完善表单信息",
						icon: "none",
						mask: true,
					});
				}
			});
		},
	},
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
