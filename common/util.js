import config from "./config.js";
export default {
	uni_request(url, param, method, changeUrl) {
		const that = this;
		const token = uni.getStorageSync("token") || "";
		return new Promise((resolve, reject) => {
			// console.log('request', url, param);
			let configUrl = changeUrl ? config.payUrlApi : config.baseUrlApi;
			let api_url = configUrl + url;
			let options = {
				url: api_url,
				data: param,
				method: method,
				dataType: "JSON",
				header: {
					"Content-Type": "application/json;charset=utf-8",
				},
			};
			if (url != "/wxminiLogin") {
				options.header.Authorization = token;
			}
			uni.request(options)
				.then((data) => {
					var [error, res] = data;
					console.log("data------>>>>>", data);
					var res_code = res.statusCode.toString();
					// console.log("res_code", res, error)
					if (res_code.charAt(0) == 2) {
						if (res_code == 200) {
							var result = res.data;
							if (typeof result === "string" && result) {
								result = JSON.parse(result);
							}
							console.log("result--登录", result);
							if (result.code == "E403") {

								uni.login({
									provider: "weixin", //使用微信登录
									success: async (loginRes) => {
										try {
											let res = await util.post("/wxminiLogin", { openIdCode: loginRes.code });
											if (res.code == "0000") {
												uni.setStorageSync("token", res.data?.token);
												that.uni_request(url, param, method);
											} else {
												uni.showToast({
													icon: "none",
													title: "请重启小程序",
													duration: 1000,
												});
											}
										} catch (err) {
											uni.showToast({
												icon: "none",
												title: "请重启小程序",
												duration: 1000,
											});
										}
									},
									fail: function (res) {
										uni.showToast({
											icon: "none",
											title: "请重新登录",
											duration: 1000,
										});
									},
								});
							} else {
								resolve(result);
							}
						} else {
							uni.showToast({
								title: res.data.msg,
								icon: "none",
							});
						}
					} else {
						uni.showToast({
							title: res.data.msg ? res.data.msg : "请求异常",
							icon: "none",
						});
						var res = {
							code: 500,
							msg: "请求异常",
						};
						resolve(res);
					}
				})
				.catch((err) => {
					console.log("catch:", err);
				});
		});
	},

	uploadFile(file, fileName) {
		const token = uni.getStorageSync("token") || "";

		return new Promise((resolve, reject) => {
			uni.showLoading({
				title: "上传中",
				mask: true,
			});
			uni.uploadFile({
				url: `${config.baseUrlApi}/file/uploadFile`,
				filePath: file,
				name: fileName || "file",
				header: {
					authorization: token,
				},
				success: (res) => {
					uni.hideLoading();

					resolve(JSON.parse(res.data));
				},
				fail: (err) => {
					uni.hideLoading();
					uni.showToast({
						icon: "fail",
						title: "上传失败，请重试",
					});

					reject(err);
				},
			});
		});
	},

	async post(url, param, payType) {
		const res = await this.uni_request(url, param, "post", payType);

		return res;
	},

	async get(url, param) {
		const res = await this.uni_request(url, param, "get");

		return res;
	},

	formatMonth(date) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${[year, month].map(this.formatNumber).join("-")}`;
	},
	formatNumber(num) {
		return num < 10 ? "0" + num : num;
	},
};
