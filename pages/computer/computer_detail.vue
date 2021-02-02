<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		onLoad(options) {
			
		},
		onShow() {
			
		},
		onHide() {
			
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(),"setForceDarkAllowed",false)')
			// #endif
		},
		methods: {
			
		}
	}
</script>

<style>
</style>
