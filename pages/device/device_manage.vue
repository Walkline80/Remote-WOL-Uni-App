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
			<uni-swipe-action>
				<uni-list
					v-for="(item, index) in device_list"
					:key="index"
					:border="false">
					<uni-swipe-action-item
						:rightOptions="swipe_options"
						@click="swipe_click($event, index)">
						<uni-list-item
							link="navigateTo"
							thumb="/static/icons/device.png"
							thumbSize="base"
							:title="item.ssid"
							:note="'mac: ' + item.bssid"
							:rightText="item.status ? '在线' : '离线'"
							style="border: none; width: 100%;"
							@click="device_item_click(item)" />
					</uni-swipe-action-item>
				</uni-list>
			</uni-swipe-action>
		</view>
	</view>
</template>

<script>
	import settings_handler from '../../common/settings_handler.js'
	
	export default {
		data() {
			return {
				swipe_options: [{
					text: '删除',
					style: {
						backgroundColor: '#ff0000'
					}
				}],
				show_notice: true,
				device_list: {}
			}
		},
		onHide() {
			
		},
		onShow() {
			// load device list from storage
			this.reload_page()
		},
		onUnload() {
			
		},
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
					animationType: 'slide-in-right'
				})
			}
		},
		methods: {
			device_item_click (item) {
				// console.log('item: ' + JSON.stringify(item))
				
				uni.navigateTo({
					url:'../device/device_detail?modify=1&item=' + encodeURIComponent(JSON.stringify(item)),
					events:{
						acceptDataFromOpenedPage(data) {
							console.log(data)
							
							this.$data.wifi_list = []
						}
					}
				})
			},
			swipe_click (event, index) {
				const id = this.$data.device_list[index].id,
					title = this.$data.device_list[index].title || this.$data.device_list[index].ssid

				uni.showModal({
					content: `是否删除设备 ${title}？`,
					confirmText: '删除',
					success: (result) => {
						if (result.confirm) {
							settings_handler.remove_device_item(id)
							this.reload_page()
							
							// app 删除后还需要在设备上清除配置文件
						}
					}
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
	
</style>
