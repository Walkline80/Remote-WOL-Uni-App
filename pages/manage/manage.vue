<template>
	<view>
		<view>
			<uni-list v-for="(item, index) in wifi_list" :key="index" :border=false>
				<uni-list-item
					link="navigateTo"
					thumb="/static/icons/wifi.png"
					thumbSize="base"
					:title="item.ssid"
					:note="'mac: ' + item.bssid + ' level: ' + item.level"
					style="border: none;"
					@click="device_detail_click(item)"></uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script>
	import * as manage from "./manage.js"
	
	export default {
		data() {
			return {
				wifi_list: []
			}
		},
		onLoad() {
			if (!this.DEV && this.ANDROID) {
				manage.grant_wifi_permission()
			}
		},
		onNavigationBarButtonTap(e) {
			// search button click event
			if (e.index == 0) {
				console.log("searching")
				
				if (this.DEV) {
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
				} else {
					this.$data.wifi_list = manage.loadWifiInfo()
				}
			}
			
			uni.showToast({
				title: "title",
				icon:"none"
			})
		},
		methods: {
			device_detail_click: function (item) {
				console.log("item: " + JSON.stringify(item))
				uni.navigateTo({
					url:"../device/device?item=" + encodeURIComponent(JSON.stringify(item)),
					events:{
						acceptDataFromOpenedPage(data) {
							console.log(data)
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
