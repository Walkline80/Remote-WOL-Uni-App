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
		<web-view :src="app_settings.data_point_url"></web-view>
	</view>
</template>

<script>
	import settings_handler from '@/common/settings_handler.js'
	
	export default {
		onLoad() {
			this.$data.app_settings = settings_handler.load_app_settings()
		},
		data() {
			return {
				app_settings: {}
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
