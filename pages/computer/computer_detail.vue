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
		<view class="header">
			<image src="@/static/icons/computer.png" mode="aspectFit" />
		</view>

		<view>
			<uni-forms :value="pc_info" ref="form" :rules="rules" style="padding: 0 15px;">
				<uni-group title="" top=0>
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
					<uni-forms-item
						label="选择分组"
						name="group_id"
						:labelWidth="label_width"
						:labelAlign="label_align"
						style="margin-bottom: 0;">
						<picker
							mode="selector"
							:range="group_items"
							range-key="name"
							:value="group_index"
							@change="group_change">
							<view class="uni-input">{{group_items[group_index].name}}</view>
						</picker>
					</uni-forms-item>
				</uni-group>
			</uni-forms>
			
			<view class="gap"></view>

			<view class="footer">
				<button type="warn" @click="button_save_click">{{view_mode ? '修改' : '保存'}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import test_data from '@/others/device_test_data.js'
	import settings_handler from '@/common/settings_handler.js'
	
	export default {
		data() {
			return {
				view_mode: false,
				popup_type: 'success',
				popup_duration: 1000,
				popup_message: '成功',
				label_width: 80,
				label_align: 'right',
				pc_info: {
					title: '',
					mac_address: '',
					group: ''
				},
				group_items: [],
				group_index: 0,
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
				let view_mode = false
				
				this.$data.group_items = settings_handler.get_group_items()
				
				if (Object.keys(options).length !== 0) {
					if (options.pc_id) {
						console.log('view pc_info, data from stroage')

						view_mode = true
						this.$data.pc_info = settings_handler.get_pc_item_by_id(options.pc_id)
					} else {
						console.log('add pc')
						view_mode = false
					}
				}
				
				if (this.DEV) {
					if (view_mode) {
						console.log('view mode, data from current page')
					} else {
						console.log('add pc, data from current page')
						this.$data.pc_info = test_data.pc_data
					}
				}
				
				if (this.$data.pc_info.group) {
					this.$data.group_items.forEach((item) => {
						if (item.device_id === this.$data.pc_info.group) {
							this.$data.group_index = item.index
						}
					})
				}
				
				this.$data.view_mode = view_mode
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					if (this.$data.view_mode) {
						settings_handler.remove_pc_item(this.$data.pc_info.id)
					}
					
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
			group_change (event) {
				this.$data.group_index = event.detail.value
				// settings_handler.update_device_item_by_id(this.$data.device_info.id, 'group_id', )
				this.$data.pc_info.group = this.$data.group_items[this.$data.group_index].device_id
			}
		}
	}
</script>

<style>
	.uni-input {
		height: 50rpx;
		padding: 15rpx 25rpx;
		line-height:50rpx;
		font-size:28rpx;
		background:#FFF;
		flex: 1;
	}

	.header {
		line-height: 150px;
		height: 150px;
		background-color: #0694a2;
		text-align: center;
	}
	
	.header image {
		vertical-align: middle;
		width: 100px;
		height: 100px;
	}
	
	.footer {
		width: 100%;
		background-color: #efefef;
	}
	
	.footer button {
		margin: 15px;
	}
</style>
