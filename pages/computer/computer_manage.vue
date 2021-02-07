<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
	<view class="content">
		<uni-drawer ref="drawer" :mask="true" :maskClick="true" mode="left">
			<uni-group title="Remote WOL" top=0>
				<uni-list :border="false">
					<uni-list-item
						title="硬件列表"
						note="硬件设备管理"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'list'}"
						clickable
						@click="open_page('../device/device_manage')"
						style="border: none;" />
					<uni-list-item
						title="设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'settings'}"
						clickable
						@click="open_page('../settings/settings')"
						style="border: none;" />
					<uni-list-item
						title="关于"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'info'}"
						clickable
						@click="open_page('../about/about')"
						style="border: none;" />
				</uni-list>
			</uni-group>
		</uni-drawer>
	</view>
</template>
<script>
	import settings_handler from '../../common/settings_handler.js'
	import mqtt from 'common/mqtt.min.js'
	
	var mqtt_client = null;
	
	export default {
		data() {
			return {
				app_settings: {}
			}
		},
		onNavigationBarButtonTap(e) {
			// search button click event
			if (e.index === 0) {
				this.$refs.drawer.open()
			}
		},
		onUnload() {
			this.end_mqtt_client()
		},
		onLoad(options) {
			this.$data.app_settings = settings_handler.load_app_settings()
			this.start_mqtt_client()
			
			uni.$on('app_settings_update', () => {
				this.$data.app_settings = settings_handler.load_app_settings()
				this.start_mqtt_client()
			})
			
			uni.$on('app_settings_validate', () => {
				// 设置页面进行 mqtt 验证的时候需要暂时结束本页面 mqtt 连接
				this.end_mqtt_client()
			})
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
			
			//settings_handler.update_device_item_status('246f289da321', true)
		},
		methods: {
			mqtt_on_message (topic, message) {
				console.log(`topic: ${topic}, message: ${message.toString()}`)
				
				if (Object.keys(message).length === 0) {return}
				
				try {
					const json_obj = JSON.parse(decodeURIComponent(message))
					let msg_obj = {}
					
					msg_obj.command = json_obj.command
					msg_obj.result = json_obj.result
					msg_obj.mac = json_obj.mac_address
					msg_obj.publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + msg_obj.mac

					switch (msg_obj.command) {
						case 'device_status_indicator':
							settings_handler.update_device_item_status(msg_obj.mac, (msg_obj.result === 'online' ? true : false));
							
							// 清除硬件设备在线状态 retain 消息 
							mqtt_client.publish(
								msg_obj.publish_topic,
								new Buffer([]),
								{retain: true},
							)
							
							uni.$emit('device_status_update')
							break
						default:
							break
					}
				} catch (error) {
					console.log('mqtt_on_message error', error)
				}
			},
			end_mqtt_client () {
				if (mqtt_client) {mqtt_client.end({force: true})}
			},
			set_mqtt_indicator_status (status) {
				let color = status ? '#F0AD4E' : '#b4b4b4'
				
				// #ifdef APP-PLUS
				let webview = this.$mp.page.$getAppWebview()
				
				webview.setTitleNViewButtonStyle(1, {
					color: color
				})
				// #endif
			},
			open_page (url) {
				// this.$refs.drawer.close()
				uni.navigateTo({
					url: url,
					animationType: "slide-in-right"
				})
			},
			start_mqtt_client () {
				const settings = this.$data.app_settings
				
				if (Object.keys(settings).length === 0) {return}
				
				this.end_mqtt_client()
				
				// var mqtt = require('mqtt/dist/mqtt.js')
				let mqtt_topic = settings.mqtt_topic_prefix + '/remote_wol_device/+',
					options = {
						keepalive: settings.mqtt_keepalive,
						clientId: settings.mqtt_client_id,
						username: settings.mqtt_username,
						password: settings.mqtt_password,
						clean: true,
						reconnectPeriod: 1000,
						connectTimeout: 10 * 1000,
					}
			
				// #ifdef APP-PLUS
				mqtt_client = mqtt.connect(`wx://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options)
				// #endif
				
				// #ifdef H5
				mqtt_client = mqtt.connect(`ws://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options)
				// #endif

				mqtt_client.on('connect', () => {
					console.log('mqtt connected')
					
					mqtt_client.subscribe(mqtt_topic, (error, granted) => {
						if (!error) {
							console.log('no error')
							this.set_mqtt_indicator_status(true)
						} else {
							console.log('got error', error)
						}
					})
				}).on('reconnect', () => {
					console.log('reconnecting...')
					this.set_mqtt_indicator_status(false)
				}).on('error', (error) => {
					console.log('on error', error)
				}).on('message', this.mqtt_on_message // (topic, message)
				).on('disconnect', () => {
					console.log('disconnect')
					this.set_mqtt_indicator_status(false)
				}).on('end', () => {
					console.log('ended')
					this.set_mqtt_indicator_status(false)
				}).on('close', () => {
					console.log('closed')
					this.set_mqtt_indicator_status(false)
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		/* color: #8f8f94; */
	}
</style>
