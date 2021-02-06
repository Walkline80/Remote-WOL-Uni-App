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
						@click="open_device_manage_page();"
						style="border: none;" />
					<uni-list-item
						title="设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'settings'}"
						clickable
						@click="open_settings_page();"
						style="border: none;" />
					<uni-list-item
						title="关于"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'info'}"
						clickable
						@click="open_about_page();"
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
				this.$refs.drawer.open();
			}
		},
		onUnload() {
			this.end_mqtt_client();
		},
		onLoad(options) {
			this.$data.app_settings = settings_handler.load_app_settings();
			this.start_mqtt_client();
			
			uni.$on('app_settings_update', () => {
				this.$data.app_settings = settings_handler.load_app_settings();
				this.start_mqtt_client();
			});
			
			uni.$on('app_settings_validate', () => {
				this.end_mqtt_client();
			});
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(),"setForceDarkAllowed",false)')
			// #endif
		},
		methods: {
			end_mqtt_client () {
				if (mqtt_client) {mqtt_client.end({force: true});}
			},
			set_mqtt_indicator_status (status) {
				var color = status ? '#F0AD4E' : '#b4b4b4';
				
				// #ifdef APP-PLUS
				var webview = this.$mp.page.$getAppWebview();
				
				webview.setTitleNViewButtonStyle(1, {
					color: color
				});
				// #endif
			},
			open_settings_page () {
				// this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../settings/settings",
					animationType: "slide-in-right"
				})
			},
			open_device_manage_page () {
				// this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../device/device_manage",
					animationType: "slide-in-right"
				})
			},
			open_about_page () {
				// this.$refs.drawer.close();
				
				uni.navigateTo({
					url: "../about/about",
					animationType: "slide-in-right"
				})
			},
			start_mqtt_client() {
				var settings = this.$data.app_settings;
				
				if (Object.keys(settings).length === 0) {return;}
				
				this.end_mqtt_client();
				
				// var mqtt = require('mqtt/dist/mqtt.js');
				var mqtt_topic = (settings.mqtt_is_bigiot ? settings.mqtt_bigiot_username : settings.mqtt_client_id) + '/remove_wol_device/#';
				var options = {
					keepalive: settings.mqtt_keepalive,
					clientId: settings.mqtt_client_id,
					username: settings.mqtt_username,
					password: settings.mqtt_password,
					clean: true,
					reconnectPeriod: 1000,
					connectTimeout: 10 * 1000,
				};
			
				// #ifdef APP-PLUS
				mqtt_client = mqtt.connect(`wx://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options);
				// #endif
				
				// #ifdef H5
				mqtt_client = mqtt.connect(`ws://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options);
				// #endif
			
				mqtt_client.on('connect', () => {
					console.log("connected");
					
					mqtt_client.subscribe(mqtt_topic, (error, granted) => {
						if (!error) {
							console.log('no error');
							this.set_mqtt_indicator_status(true);
						} else {
							console.log('got error', error);
						}
					});
				}).on('reconnect', () => {
					console.log('reconnecting...');
					this.set_mqtt_indicator_status(false);
				}).on('error', (error) => {
					console.log('on error', error);
				}).on('message', (topic, message) => {
					console.log(`topic: ${topic}, message: ${message.toString()}`);
					
					// if (topic === mqtt_topic) {
					// 	if (message.toString() === 'success') {
					// 		mqtt_client.end({forcus:true});
					// 	}
					// }
				}).on('disconnect', () => {
					console.log("disconnect");
					this.set_mqtt_indicator_status(false);
				}).on('end', () => {
					console.log('ended');
					this.set_mqtt_indicator_status(false);
				}).on('close', () => {
					console.log('closed');
					this.set_mqtt_indicator_status(false);
				});
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
