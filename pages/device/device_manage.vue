<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
	<view class="page_notice" v-show="show_notice">
		<text>点击加号添加硬件</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show_notice: true
			}
		},
		onHide() {
			
		},
		onShow() {
			// load device list from storage
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