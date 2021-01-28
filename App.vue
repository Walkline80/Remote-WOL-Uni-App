<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<script>
	import wifi_handler from "common/wifi_handler.js"
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// #ifdef APP-PLUS
			wifi_handler.grant_wifi_permission()
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
