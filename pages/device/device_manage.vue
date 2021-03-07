<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
	<view>
		<view class="page_notice" v-show="show_notice">
			<text>点击加号添加硬件</text>
		</view>
		<view>
			<uni-forms ref="form" style="padding: 0;">
				<uni-list
					v-for="(item, index) in device_list"
					:key="index"
					:border="false">
					<uni-list-item
						link
						thumb="/static/icons/device.png"
						thumbSize="base"
						:title="item.hardware_name + (item.hardware_memo !== undefined && item.hardware_memo !== '' ? ' (' + item.hardware_memo + ')' : '') || item.ssid"
						:note="'mac: ' + item.bssid"
						:rightText="item.status ? '在线' : '离线'"
						@click="device_item_click(item)">
					</uni-list-item>
				</uni-list>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import settings_handler from '@/common/settings_handler.js'
	
	export default {
		data() {
			return {
				show_notice: true,
				device_list: {}
			}
		},
		onHide() {},
		onShow() {
			// load device list from storage
			this.reload_page()
		},
		onUnload() {},
		onLoad(options) {
			uni.$on('device_status_update', () => {
				this.reload_page()
			})
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
		},
		onNavigationBarButtonTap(e) {
			// add button click event
			if (e.index == 0) {
				console.log('adding')
				
				uni.navigateTo({
					url: './device_add',
					animationType: 'slide-in-bottom'
				})
			}
		},
		methods: {
			device_item_click (item) {
				// console.log('item: ' + JSON.stringify(item))
				uni.navigateTo({
					url:`../device/device_detail?device_id=${item.id}`,
					animationType: "zoom-fade-out"
				})
			},
			reload_page () {
				this.$data.device_list = settings_handler.load_device_items()
				this.$data.show_notice = this.$data.device_list.length === 0 ? true : false
			}
		}
	}
</script>

<style>
	/* .uni-list-item {
		border-top: 1px solid lightgrey;
	} */
</style>
