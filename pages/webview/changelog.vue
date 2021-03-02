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
		<web-view :src="changelog_src" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				changelog_src: 'https://gitee.com/walkline/remote-wol-uni-app'
			}
		},
		methods: {}
	}
</script>

<style>

</style>
