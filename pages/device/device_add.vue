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
			<text>下拉搜索周围的硬件设备</text>
		</view>
		<view>
			<uni-list v-for="(item, index) in wifi_list" :key="index" :border="false">
				<uni-list-item
					v-if="item.ssid.startsWith('wol_')"
					link="navigateTo"
					:thumb="'/static/icons/wifi_level/' + calculate_signal_level(item.level) + '.png'"
					thumbSize="base"
					:title="item.ssid"
					:note="'mac: ' + item.bssid"
					@click="device_settings_click(item)" />
			</uni-list>
		</view>
	</view>
</template>

<script>
	import wifi_handler from '@/common/wifi_handler.js'
		
	export default {
		data() {
			return {
				wifi_list: [],
				show_notice: true
			}
		},
		onUnload() {
			
		},
		onShow() {
			this.$data.show_notice = this.$data.wifi_list.length === 0 ? true : false
		},
		onLoad(options) {
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
		},
		onPullDownRefresh () {
			console.log('searching wifi...')
			
			// #ifdef APP-PLUS
			this.$data.wifi_list = wifi_handler.scan_wifi()
			// #endif
			
			// #ifndef APP-PLUS
			this.$data.wifi_list = [{
				"index": 0,
				"ssid": "zysa-2.4G",
				"bssid": "d0:76:e7:10:04:3b",
				"level": -37
			}, {
				"index": 1,
				"ssid": "zysa-5G",
				"bssid": "d0:76:e7:10:04:3d",
				"level": -38
			}, {
				"index": 2,
				"ssid": "wol_246f289da321",
				"bssid": "24:6f:28:9d:a3:21",
				"level": -73
			}, {
				"index": 3,
				"ssid": "TP-LINK_3470",
				"bssid": "54:a7:03:ea:34:70",
				"level": -58
			}]
			// #endif
			
			this.$data.show_notice = this.$data.wifi_list.length === 0 ? true : false
			uni.stopPullDownRefresh()
		},
		methods: {
			device_settings_click: (item) => {
				console.log('item: ' + JSON.stringify(item))
				
				uni.navigateTo({
					url: '../device/device_settings?device_item=' + encodeURIComponent(JSON.stringify(item)),
					events: {
						acceptDataFromOpenedPage(data) {
							console.log('data from prev page', data)
							
							// this.$data.wifi_list = []
							// uni.startPullDownRefresh()
						}
					}
				})
			},
			calculate_signal_level: (rssi, num_levels=5) => {
				const MIN_RSSI = -100,
					MAX_RSSI = -55,
					input_range = MAX_RSSI - MIN_RSSI,
					output_range = num_levels - 1

				if (rssi <= MIN_RSSI) {
					return 0
				} else if (rssi >= MAX_RSSI) {
					return num_levels - 1
				} else {
					return parseInt((rssi - MIN_RSSI) * output_range / input_range)
				}
			}
		}
	}
</script>

<style>

</style>
