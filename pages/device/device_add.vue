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
					thumb="/static/icons/wifi.png"
					thumbSize="base"
					:title="item.ssid"
					:note="'mac: ' + item.bssid + ' level: ' + item.level"
					style="border: none;"
					@click="device_detail_click(item)" />
			</uni-list>
		</view>
	</view>
</template>

<script>
	import wifi_handler from "../../common/wifi_handler.js"
		
	export default {
		data() {
			return {
				wifi_list: [],
				show_notice: true
			}
		},
		onShow() {
			if (this.$data.wifi_list === null) {this.$data.show_notice = true;}
		},
		onLoad(options) {
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(),"setForceDarkAllowed",false)')
			// #endif
		},
		onPullDownRefresh () {
			console.log("searching")
			
			// #ifdef APP-PLUS
			this.$data.wifi_list = wifi_handler.scan_wifi()
			// #endif
			
			// #ifndef APP-PLUS
			this.$data.wifi_list = [{
				"id": 0,
				"ssid": "zysa-2.4G",
				"bssid": "d0:76:e7:10:04:3b",
				"level": -37
			}, {
				"id": 1,
				"ssid": "zysa-5G",
				"bssid": "d0:76:e7:10:04:3d",
				"level": -38
			}, {
				"id": 2,
				"ssid": "wol_246F289DA320",
				"bssid": "24:6f:28:9d:a3:21",
				"level": -39
			}, {
				"id": 3,
				"ssid": "TP-LINK_3470",
				"bssid": "54:a7:03:ea:34:70",
				"level": -58
			}]
			// #endif
			this.$data.show_notice = this.$data.wifi_list === null ? true : false;
			uni.stopPullDownRefresh();
		},
		methods: {
			device_detail_click: function (item) {
				var that = this;
				
				console.log("item: " + JSON.stringify(item))
				
				uni.navigateTo({
					url:"../device/device_detail?item=" + encodeURIComponent(JSON.stringify(item)),
					events:{
						acceptDataFromOpenedPage(data) {
							console.log(data);
							
							that.$data.wifi_list = null;
							// uni.startPullDownRefresh();
						}
					}
				})
			}
		}
	}

	
</script>

<style>
	button {
		float: right;
		margin: 10rpx;
	}
</style>
