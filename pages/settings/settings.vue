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
		<button @click="button_test();">测试</button>
	</view>
</template>

<script>
	import wifi_handler from "../../common/wifi_handler.js"
	
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			button_test: function () {
				// #ifdef APP-PLUS
				// wifi_handler.is_wifi_config_exist("zysa-2.4G")
				if (wifi_handler.connect("wol_246F289DA320")) {
					console.log(wifi_handler.get_dhcp_info())
					
					uni.showToast({
						title: "connected"
					})
				}
				// #endif
			}
		}
	}
</script>

<style>

</style>
