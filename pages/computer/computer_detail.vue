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
		<view class="">
			<uni-forms :value="pc_info" ref="form" :rules="rules">
				<uni-group title="PC 设置" top=-10>
					<uni-forms-item
						required
						label="名称"
						name="title"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="pc_info.title" />
					</uni-forms-item>
					<uni-forms-item
						required
						label="MAC 地址"
						name="mac_address"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="00:11:22:33:44:55"
							v-model="pc_info.mac_address" />
					</uni-forms-item>
				</uni-group>
				
				<view class="button-group" style="margin-top: 30rpx;">
					<button style="width: 100%;" type="warn" @click="button_save_click">保存</button>
				</view>
			</uni-forms>
		</view>
	</view>
</template>

<script>
	import test_data from '../../others/device_test_data.js'
	import settings_handler from '../../common/settings_handler.js'
	
	export default {
		data() {
			return {
				popup_type: 'success',
				popup_duration: 1000,
				popup_message: '成功',
				label_width: 80,
				label_align: 'right',
				pc_info: {},
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: '名称'
					},
					mac_address: {
						rules: [
							{
								required: true,
								errorMessage: '{label}不能为空'
							},
							{
								pattern: /^([0-9A-F]{2})(((:)[0-9A-F]{2}){5})$/i,
								errorMessage: '{label}格式错误'
							}
						],
						label: 'MAC 地址'
					},
				}
			}
		},
		onUnload() {
			
		},
		onLoad(options) {
			this.load_pc_info(options)
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
			load_pc_info (options) {
				let item
				const modify = true
				
				if (Object.keys(options).length !== 0) {
					console.log('item data from prev page')
					item = JSON.parse(decodeURIComponent(options.item))
				} else {
					console.log('item data from current page')
					
					if (modify) {
						options.modify = '1'
						item = JSON.parse('{"id": "remote_wol_pc_00:11:22:33:44:55","mac_address": "00:11:22:33:44:55",	"title": "群晖 NAS111"}')
					} else {
						options.modify = '0'
					}
				}
				
				if (options.modify === '0') {
					console.log('pc append')
					
					if (this.DEV) {this.$data.pc_info = test_data.pc_data}
				} else {
					console.log('pc modify')
					this.$data.pc_info = item
				}
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					settings_handler.remove_pc_item(this.$data.pc_info.id)
					
					if (settings_handler.save_pc_item(this.$data.pc_info)) {
						uni.navigateBack({
							delta: 1,
						})
						
						uni.$emit('pc_items_update')
					}
				}).catch(error => {
					console.log('form error: ', error)
				})
			},
		}
	}
</script>

<style>
</style>
