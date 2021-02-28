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
		<view v-if="mode==='import'">
			<text>import</text>
		</view>
		<view v-else-if="mode==='scan'">
			<text>scan</text>
		</view>
	</view>
</template>

<script>
	import settings_handler from '@/common/settings_handler.js'
	
	export default {
		data () {
			return {
				mode: 'input',
			}
		},
		onUnload() {
			
		},
		onLoad(options) {
			this.$data.mode = options.mode || 'import'
		},
		onShow() {
			
		},
		onHide() {
			
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
		},
		methods: {
			
		}
	}
</script>

<style>
	.button-group {
		display: flex;
	}
</style>
