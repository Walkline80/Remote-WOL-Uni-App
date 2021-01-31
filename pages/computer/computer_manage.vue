<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
	<view class="content">
		<uni-drawer ref="drawer" :mask="true" :maskClick="true" mode="left">
			<uni-group title="Remote WOL" top=0>
				<uni-list :border="false">
					<uni-list-item
						title="硬件列表"
						note="硬件设备管理"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'list'}"
						clickable
						@click="open_device_manage_page();"
						style="border: none;" />
					<uni-list-item
						title="设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'settings'}"
						clickable
						@click="open_settings_page();"
						style="border: none;" />
					<uni-list-item
						title="关于"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'info'}"
						clickable
						@click="open_about_page();"
						style="border: none;" />
				</uni-list>
			</uni-group>
		</uni-drawer>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				
			}
		},
		onNavigationBarButtonTap(e) {
			// search button click event
			if (e.index == 0) {
				this.$refs.drawer.open();
			}
			
			// uni.showToast({
			// 	title: "title",
			// 	icon:"none"
			// })
		},
		onLoad() {

		},
		methods: {
			open_settings_page () {
				this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../settings/settings",
					animationType: "slide-in-right"
				})
			},
			open_device_manage_page () {
				this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../device/device_manage",
					animationType: "slide-in-right"
				})
			},
			open_about_page () {
				this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../about/about",
					animationType: "slide-in-right"
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		/* color: #8f8f94; */
	}
</style>
