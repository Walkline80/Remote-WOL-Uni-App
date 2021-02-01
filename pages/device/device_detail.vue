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
			<uni-forms :value="device_info" ref="form" :rules="rules">
				<uni-group title="硬件信息" top=0>
					<view>{{device_info.ssid}} ({{device_info.bssid}})</view>
				</uni-group>
				<uni-group title="设置 WIFI" top=0>
					<uni-forms-item required label="名称" name="wifi_ssid" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.wifi_ssid" />
					</uni-forms-item>
					<uni-forms-item required label="密码" name="wifi_password" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="password" v-model="device_info.wifi_password" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="设置 MQTT" top=0>
					<uni-forms-item required name="mqtt_host" label="服务器" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.mqtt_host" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_port" label="端口" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.mqtt_port" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_client_id" label="客户端 ID" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.mqtt_client_id" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_username" label="用户名" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.mqtt_username" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_password" label="密码" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="password" v-model="device_info.mqtt_password" />
					</uni-forms-item>
				</uni-group>
				
				<view class="button-group">
					<button style="width: 50%;" type="primary" @click="button_test_click()">测试</button>
					<button style="width: 30%;" type="warn" @click="button_save_click()">保存</button>
				</view>
			</uni-forms>
	    </view>
		<view>
			<uni-popup ref="popup_message" type="message">
				<uni-popup-message :type="popup_type" :message="popup_message" :duration="popup_duration" />
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import test_data from '../../others/device_test_data.js'

	export default {
		data() {
			return {
				popup_type: "success",
				popup_duration: 1000,
				popup_message: "成功",
				label_width: 70,
				label_align: "right",
				device_info: null,
				event_channel: null,
				rules: {
					wifi_ssid: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "WIFI 名称"
					},
					wifi_password: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						},{
							minLength: 8,
							message: "{label}长度不能少于8个字符"
						}],
						label: "WIFI 密码"
					},
					mqtt_host: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "MQTT 服务器地址"
					},
					mqtt_port: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "MQTT 服务器端口"
					},
					mqtt_client_id: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "MQTT 客户端 ID "
					},
					mqtt_username: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "MQTT 用户名"
					},
					mqtt_password: {
						rules: [{
							required: true,
							errorMessage: "{label}不能为空"
						}],
						label: "MQTT 密码"
					}
				}
			}
		},
		onLoad(options) {
			// #ifdef APP-PLUS
			const item = JSON.parse(decodeURIComponent(options.item))
			// #endif
			
			// #ifndef APP-PLUS
			const item = JSON.parse('{"id":0,"ssid":"wol_246f289da320","bssid":"24:6f:28:9d:a3:21","level":-37}')
			// #endif
			
			const event_channel = this.getOpenerEventChannel()
			
			// event_channel.emit('acceptDataFromOpenedPage', "feedback")
			this.$data.device_info = item
			this.$data.event_channel = event_channel
			
			this.$data.device_info.wifi_ssid = test_data.data.wifi_ssid
			this.$data.device_info.wifi_password = test_data.data.wifi_password
			this.$data.device_info.mqtt_host = test_data.data.mqtt_host
			this.$data.device_info.mqtt_port = test_data.data.mqtt_port
			this.$data.device_info.mqtt_client_id = test_data.data.mqtt_client_id
			this.$data.device_info.mqtt_username = test_data.data.mqtt_username
			this.$data.device_info.mqtt_password = test_data.data.mqtt_password
			this.$data.device_info.websocket_port = test_data.data.websocket_port
			this.$data.device_info.websocket_path = test_data.data.websocket_path
			
		},
		onReady() {
			// this.$refs.popup_message.open();
		},
		methods: {
			button_test_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log("form info: ", result);
					
					this.start_websocket_client();
				}).catch(error => {
					console.log("form error: ", error);
				})
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log("form info: ", result);

					uni.navigateBack({
						delta: 2,
					});
					
					this.$data.event_channel.emit('acceptDataFromOpenedPage', 'device_added');
					
				}).catch(error => {
					console.log("form error: ", error);
				})
			},
			show_popup_message (message, type="error", duration=3000) {
				this.$data.popup_type = type;
				this.$data.popup_message = message;
				this.$data.popup_duration = duration;
				this.$refs.popup_message.open();				
			},
			start_websocket_client () {
				var that = this;
				
				uni.connectSocket({
					url: "ws://localhost:" + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path,
					success () {
						console.log("websocket completed");
					}
				});
				
				uni.onSocketOpen(function (res){
					console.log("websocket opened");
					
					const params = {
						command: "identity",
					};
					
					uni.sendSocketMessage({
						data: JSON.stringify(params)
					});
				});
				
				uni.onSocketError(function (res){
					console.log("websocket error:", res);
				});
				
				uni.onSocketMessage(function (res){
					const result = JSON.parse(res.data);
					console.log("websocket message:", result);
					
					switch (result.command) {
						case 'identity_result':
							if (result.result === 'success') {
								if (that.$data.device_info.bssid.replace(new RegExp(':', 'g'), '') === result.mac_address) {
									that.$data.device_info.hardware_name = result.hardware_name;
									that.$data.device_info.hardware_version = result.hardware_version;
									
									//keep going
								} else {
									that.show_popup_message('mac address not match');
								}
							}
							break;
						case 'check_wifi_result':
							//
							break;
						case 'check_internet_result':
							//
							break;
						case 'check_mqtt_result':
							//
							break;
						case 'save_settings_result':
							//
							break;
						default:
							that.show_popup_message(`Unknown command: ${result.command}`, "error", 3000);
					}
				});
				
				uni.onSocketClose(function (res){
					console.log("websocket closed");
				});
			}
		}
	}
</script>

<style>
.button-group {
	display: flex;
}
</style>
