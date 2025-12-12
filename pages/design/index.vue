<template>
  <view class="design-page">
    <!-- 顶部导航，保持与项目一致 -->
    <nav-bar :is-back="true" :title="pageTitle" bgColor="#121325" titleColor="#fff" />

    <!-- 设计页主体容器：按蓝湖分区结构布局 -->
    <scroll-view class="content" scroll-y>
      <!-- 顶部横幅区域：用于呈现主视觉/品牌元素 -->
      <view class="section hero">
        <image class="hero-image" :src="heroImage" mode="widthFix" />
        <view class="hero-text">
          <text class="hero-title">{{ heroTitle }}</text>
          <text class="hero-subtitle">{{ heroSubtitle }}</text>
        </view>
      </view>

      <!-- 功能区块：按设计稿分组的入口或模块卡片 -->
      <view class="section feature-grid">
        <view class="grid">
          <view class="grid-item" v-for="item in features" :key="item.id" @click="onFeatureClick(item)">
            <image class="grid-icon" :src="item.icon" mode="aspectFill" />
            <text class="grid-title">{{ item.title }}</text>
            <text class="grid-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 列表区块：用于信息/商品/活动列表展示 -->
      <view class="section card-list">
        <view class="card" v-for="card in cards" :key="card.id" @click="onCardClick(card)">
          <image class="card-cover" :src="card.cover" mode="aspectFill" />
          <view class="card-body">
            <view class="card-title">{{ card.title }}</view>
            <view class="card-subtitle">{{ card.subtitle }}</view>
            <view class="card-meta">
              <text class="card-tag" v-for="t in card.tags" :key="t">{{ t }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部说明/版权区域：与项目信息保持一致 -->
      <view class="section footer">
        <text class="footer-text">所属团队：6637839的团队</text>
        <text class="footer-text">相关项目：太实荟</text>
        <text class="footer-text">设计稿有效期：2025-11-20 至 2025-12-04</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 页面标题
      pageTitle: '太实荟',
      // 顶部主视觉内容
      heroImage: '/static/img/login_bg.png',
      heroTitle: '太实荟',
      heroSubtitle: '为城市生活提供更实在的权益与服务',
      // 网格功能入口数据
      features: [
        { id: 1, title: '权益中心', desc: '查看与使用权益', icon: '/static/img/order_mine.png', link: '/pages/orderPage/index' },
        { id: 2, title: '活动专区', desc: '参与精选活动', icon: '/static/img/navigation_icons.png', link: '/pages/home/index' },
        { id: 3, title: '商户列表', desc: '附近优选商户', icon: '/static/img/shop-icon.png', link: '/pages/merchant/list' },
        { id: 4, title: '我的账户', desc: '余额与卡券', icon: '/static/img/logo.png', link: '/pages/mine/index' },
      ],
      // 卡片列表数据（可替换为接口返回）
      cards: [
        { id: 101, title: '城市福利节', subtitle: '参与活动赢好礼', cover: '/static/img/login_bg.png', tags: ['热度', '限时'], link: '/pages/orderPage/index' },
        { id: 102, title: '餐饮联盟', subtitle: '立享优惠套餐', cover: '/static/img/shop_icons.png', tags: ['美食', '福利'], link: '/pages/merchant/list' },
        { id: 103, title: '出行特惠', subtitle: '通勤更省心', cover: '/static/img/navigation_icons.png', tags: ['出行', '折扣'], link: '/pages/home/index' },
      ],
    }
  },
  methods: {
    // 功能入口跳转
    onFeatureClick(item) {
      if (!item.link) return
      uni.navigateTo({ url: item.link })
    },
    // 卡片点击跳转
    onCardClick(card) {
      if (!card.link) return
      uni.navigateTo({ url: card.link })
    },
  }
}
</script>

<style lang="scss" scoped>
.design-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F6FA;
}

.content {
  flex: 1;
}

.section {
  padding: 32rpx 24rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .hero-image {
    width: 100%;
    border-radius: 24rpx;
    background: #EDEFF5;
  }
  .hero-text {
    margin-top: 24rpx;
    .hero-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #121325;
    }
    .hero-subtitle {
      margin-top: 8rpx;
      font-size: 26rpx;
      color: #727477;
    }
  }
}

.feature-grid {
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 24rpx;
  }
  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  }
  .grid-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    background: #F0F2F7;
    margin-bottom: 16rpx;
  }
  .grid-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1E222B;
  }
  .grid-desc {
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #727477;
  }
}

.card-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 20rpx;
  .card {
    display: flex;
    flex-direction: row;
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  }
  .card-cover {
    width: 240rpx;
    height: 180rpx;
    background: #EDEFF5;
  }
  .card-body {
    flex: 1;
    padding: 16rpx 20rpx;
    .card-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #121325;
    }
    .card-subtitle {
      margin-top: 8rpx;
      font-size: 24rpx;
      color: #727477;
    }
    .card-meta {
      margin-top: 12rpx;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12rpx;
      .card-tag {
        font-size: 22rpx;
        color: #196FFF;
        background: rgba(25, 111, 255, 0.06);
        border-radius: 12rpx;
        padding: 8rpx 12rpx;
      }
    }
  }
}

.footer {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  color: #727477;
  font-size: 22rpx;
}

/* 响应式断点样式：在较宽设备上改为三列布局 */
@media screen and (min-width: 768px) {
  .feature-grid .grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .card-list {
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 20rpx;
  }
}
</style>