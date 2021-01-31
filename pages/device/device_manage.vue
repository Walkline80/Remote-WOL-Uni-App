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
		<text>无设备</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		onLoad(options) {
			
		},
		onReady() {
		},
		onNavigationBarButtonTap(e) {
			// add button click event
			if (e.index == 0) {
				console.log("adding")
				
				uni.navigateTo({
					url: "./device_add",
					animationType: "slide-in-right"
				})
			}
		},
		methods: {
		}
	}
</script>

<style>
</style>