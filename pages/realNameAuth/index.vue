<template>
  <view class="real-name-contain">
    <nav-bar bgColor="#FFF" title="实名认证" />
    
    <view class="form-container">
      <u-form :model="form" ref="uForm" :rules="rules">
        <u-form-item label="姓名" prop="name" label-width="150">
          <u-input v-model="form.name" placeholder="请输入真实姓名" />
        </u-form-item>
        
        <u-form-item label="身份证号" prop="idCard" label-width="150">
          <u-input v-model="form.idCard" placeholder="请输入身份证号码" />
        </u-form-item>
        
        <u-form-item label="手机号" prop="phone" label-width="150">
          <u-input v-model="form.phone" placeholder="请输入手机号码" />
        </u-form-item>
        
        <u-form-item label="验证码" prop="code" label-width="150" class="no-border">
          <u-input v-model="form.code" placeholder="请输入验证码" />
          <view 
            :class="['code-btn', { disabled: codeDisabled }]"
            @click="!codeDisabled && getCode()"
          >
            {{ codeText }}
          </view>
        </u-form-item>
      </u-form>
    </view>
    
    <view class="confirm-btn" @click="submitForm">确认</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        idCard: '',
        phone: '',
        code: ''
      },
      rules: {
        name: [
          { 
            required: true, 
            message: '请输入姓名', 
            trigger: 'blur' 
          }
        ],
        idCard: [
          { 
            required: true, 
            message: '请输入身份证号', 
            trigger: 'blur' 
          },
          {
            pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            message: '请输入正确的身份证号',
            trigger: 'blur'
          }
        ],
        phone: [
          { 
            required: true, 
            message: '请输入手机号', 
            trigger: 'blur' 
          },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ],
        code: [
          { 
            required: true, 
            message: '请输入验证码', 
            trigger: 'blur' 
          }
        ]
      },
      codeText: '获取验证码',
      codeDisabled: false,
      countdown: 60
    }
  },
  methods: {
    // 获取验证码
    getCode() {
      if (!this.form.phone) {
        this.$u.toast('请先输入手机号');
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.$u.toast('请输入正确的手机号');
        return;
      }
      
      // 这里应该调用获取验证码的API
      this.$u.toast('验证码已发送');
      
      // 开始倒计时
      this.codeDisabled = true;
      this.countdown = 60;
      
      const timer = setInterval(() => {
        this.countdown--;
        this.codeText = `${this.countdown}s后重新获取`;
        
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.codeText = '获取验证码';
          this.codeDisabled = false;
        }
      }, 1000);
    },
    
    // 提交表单
    submitForm() {
      this.$refs.uForm.validate(valid => {
        if (valid) {
          // 表单验证通过，准备提交数据
          const formData = {
            name: this.form.name,
            idCard: this.form.idCard,
            phone: this.form.phone,
            code: this.form.code
          };
          
          // 这里应该调用提交实名认证的API
          console.log('提交表单数据:', formData);
          
          // 模拟API请求
          this.$u.toast('提交成功');
          uni.navigateTo({
            url: '/pages/home/index'
          })
          // 实际项目中，这里应该调用API接口
          // 例如：
          // this.$http.post('/api/real-name-auth', formData).then(res => {
          //   if (res.data.code === 200) {
          //     this.$u.toast('实名认证成功');
          //     // 跳转到其他页面或执行其他操作
          //   } else {
          //     this.$u.toast(res.data.message || '实名认证失败');
          //   }
          // }).catch(err => {
          //   console.error('实名认证请求失败:', err);
          //   this.$u.toast('网络错误，请稍后重试');
          // });
        } else {
          this.$u.toast('请完善表单信息');
        }
      });
    }
  },
  
  mounted() {
    console.log("实名认证")
  }
}
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>