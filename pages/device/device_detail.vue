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
			<image src="@/static/icons/chip.png" mode="aspectFit" />
		</view>
		<view>
			<uni-forms :value="device_info" style="padding: 0;">
				<!-- <uni-group title="关于" top=-10> -->
				<uni-list :border="false">
					<uni-list-item
						:rightText="device_info.hardware_name"
						title="硬件名称"
						:showExtraIcon="false"
						:extraIcon="{size: '22',type: 'compose'}">
					</uni-list-item>
					<uni-list-item
						:rightText="device_info.hardware_version"
						title="固件版本"
						:showExtraIcon="false"
						:extraIcon="{size: '22',type: 'compose'}"
						@click="open_page('../device/device_manage')">
					</uni-list-item>
					<uni-list-item
						:rightText="device_info.ssid"
						title="热点名称"
						:showExtraIcon="false"
						:extraIcon="{size: '22',type: 'compose'}">
					</uni-list-item>
					<uni-list-item
						:rightText="device_info.ip_address"
						title="IP 地址"
						:showExtraIcon="false"
						:extraIcon="{size: '22',type: 'compose'}">
					</uni-list-item>
					<uni-list-item
						:rightText="device_info.bssid"
						title="MAC 地址"
						:showExtraIcon="false"
						:extraIcon="{size: '22',type: 'compose'}">
					</uni-list-item>
				</uni-list>
				
				<view class="gap"></view>
				
				<uni-list :border="false">
					<uni-list-item
						link
						:rightText="device_info.hardware_memo"
						title="备注"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'compose'}"
						@click="popup_show">
					</uni-list-item>
					<uni-list-item
						link
						title="查看设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'gear'}"
						@click="device_item_click()">
					</uni-list-item>
					<uni-list-item
						link
						title="日志记录"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'list'}"
						@click="get_device_logs">
					</uni-list-item>
				</uni-list>
				
				<view class="gap"></view>
				
				<uni-list :border="false">
					<uni-list-item
						clickable
						title="重新启动"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'reload'}"
						@click="device_reboot">
					</uni-list-item>
				</uni-list>
				<!-- </uni-group> -->
			</uni-forms>
			
			<view class="gap"></view>
			<view class="footer">
				<button type="warn" style="margin: 15px;" @click="delete_device">删除硬件</button>
			</view>
		</view>
		<view>
			<uni-popup ref="popup" type="dialog">
				<uni-popup-dialog
					type="success"
					mode="input"
					title="修改备注"
					:value="device_info.hardware_memo"
					@confirm="popup_confirm"
					/>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import settings_handler from '@/common/settings_handler.js'
	import test_data from '@/others/device_test_data.js'

	export default {
		data() {
			return {
				device_info: {
					hardware_memo: '',
					ip_address: ''
				},
				event_channel: null
			}
		},
		onUnload() {},
		onLoad(options) {
			this.load_device_info(options)
			this.$data.event_channel = this.getOpenerEventChannel()
			// event_channel.emit('acceptDataFromOpenedPage', 'feedback')
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
		},
		onShow() {},
		onHide() {},
		methods: {
			load_device_info (options) {
				if (Object.keys(options).length !== 0) {
					if (options.device_id) {
						this.$data.device_info = settings_handler.get_device_item_by_id(options.device_id)
						if (!this.$data.device_info.hardware_memo) {this.$data.device_info.hardware_memo = ''}
						if (!this.$data.device_info.ip_address) {this.$data.device_info.ip_address = ''}
					} else {
						if (this.DEV) {
							this.$data.device_info = test_data.device_data
						} else {
							uni.navigateBack({
								delta: 1
							})
						}
					}
				} else {
					if (this.DEV) {
						this.$data.device_info = test_data.device_data
					} else {
						uni.navigateBack({
							delta: 1
						})
					}
				}
			},
			device_item_click () {
				uni.navigateTo({
					// url:'../device/device_settings?modify=1&item=' + encodeURIComponent(JSON.stringify(item)),
					// 传递 device_id 参数为 查看设置
					url:`../device/device_settings?device_id=${this.$data.device_info.id}`,
					animationType: "zoom-fade-out",
					events:{
						acceptDataFromOpenedPage(data) {
							console.log(data)
						}
					}
				})
			},
			popup_show () {
				this.$refs.popup.open()
			},
			popup_confirm (done, value) {
				this.$data.device_info.hardware_memo = value
				settings_handler.save_device_item(this.$data.device_info)
				
				done()
			},
			delete_device () {
				uni.showModal({
					title: '是否删除硬件？',
					content: '删除后硬件设备会恢复出厂设置',
					confirmText: '删除',
					success: (result) => {
						if (result.confirm) {
							uni.$emit('device_remove', this.$data.device_info)
							
							uni.navigateBack({
								delta: 1
							})
						}
					}
				})
			},
			device_reboot () {
				uni.$emit('device_reboot', this.$data.device_info)
			},
			get_device_logs () {
				uni.$emit('get_device_logs', this.$data.device_info)
			}
		}
	}
</script>

<style>
	.header {
		line-height: 150px;
		height: 150px;
		background-color: #006390;
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
</style>
