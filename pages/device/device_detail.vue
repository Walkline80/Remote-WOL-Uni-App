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
				<uni-group title="硬件信息" top=-10>
					<view>{{device_info.ssid}} ({{device_info.bssid}})</view>
				</uni-group>
				<uni-group title="设置 WIFI" top=0>
					<uni-forms-item required label="名称" name="wifi_ssid" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.wifi_ssid" />
					</uni-forms-item>
					<uni-forms-item required label="密码" name="wifi_password" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="password" :inputBorder="false" v-model="device_info.wifi_password" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="设置 MQTT" top=0>
					<uni-forms-item required name="mqtt_host" label="服务器" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.mqtt_host" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_port" label="端口" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.mqtt_port" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_keepalive" label="KeepAlive" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.mqtt_keepalive" />
					</uni-forms-item>
					<uni-forms-item name="mqtt_bigiot_server" label="扇贝物联" :labelWidth="label_width" :labelAlign="label_align">
						<switch v-model="device_info.mqtt_bigiot_server" @change="switch_to_bigiot"></switch>
					</uni-forms-item>
					<uni-forms-item name="mqtt_bigiot_username" v-show="is_bigiot_server" label="扇贝用户名" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" v-model="device_info.mqtt_bigiot_username" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_client_id" label="客户端 ID" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.mqtt_client_id" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_username" label="用户名" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="text" :inputBorder="false" v-model="device_info.mqtt_username" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_password" label="密码" :labelWidth="label_width" :labelAlign="label_align">
						<uni-easyinput type="password" :inputBorder="false" v-model="device_info.mqtt_password" />
					</uni-forms-item>
				</uni-group>
				
				<view class="button-group" style="margin-top: 30rpx;">
					<button style="width: 50%;" type="primary" @click="button_test_click">测试</button>
					<button style="width: 30%;" type="warn" @click="button_save_click">保存</button>
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
	import wifi_handler from '../../common/wifi_handler.js'
	import settings_handler from '../../common/settings_handler.js'

	export default {
		data() {
			return {
				is_bigiot_server: false,
				popup_type: "success",
				popup_duration: 1000,
				popup_message: "成功",
				label_width: 70,
				label_align: "right",
				device_info: {},
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
			this.load_device_info(options);
			
			this.$data.event_channel = this.getOpenerEventChannel();
			// event_channel.emit('acceptDataFromOpenedPage', "feedback")
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(),"setForceDarkAllowed",false)')
			// #endif
		},
		methods: {
			load_device_info (options) {
				var item;
				var modify = true;

				if (Object.keys(options).length !== 0) {
					console.log("item data from prev page");
					item = JSON.parse(decodeURIComponent(options.item));
				} else {
					console.log("item data from current page");
					if (modify) {
						options.modify = "1";
						item = JSON.parse('{"ssid":"wol_246f289da321","bssid":"24:6f:28:9d:a3:21","level":-37,"wifi_ssid":"duoduohome","wifi_password":"8888888888","mqtt_host":"47.102.44.223","mqtt_port":1883,"mqtt_keepalive":120,"mqtt_is_bigiot":false,"mqtt_bigiot_username":"walkline","mqtt_client_id":"walkline_remote_wol","mqtt_username":"24","mqtt_password":"o9tkA75GL","websocket_port":"80","websocket_path":"/control","id":"remote_wol_device_24:6f:28:9d:a3:21"}');
					} else {
						options.modify = "0";
						item = JSON.parse('{"index":0,"ssid":"wol_246f289da321","bssid":"24:6f:28:9d:a3:21","level":-37}');
					}
				}

				if (options['modify'] === "0") {
					console.log("device append");
					this.$data.device_info.ssid = item.ssid
					this.$data.device_info.bssid = item.bssid
					this.$data.device_info.level = item.level
					
					this.$data.device_info.wifi_ssid = test_data.device_data.wifi_ssid
					this.$data.device_info.wifi_password = test_data.device_data.wifi_password
					this.$data.device_info.mqtt_host = test_data.device_data.mqtt_host
					this.$data.device_info.mqtt_port = test_data.device_data.mqtt_port
					this.$data.device_info.mqtt_keepalive = test_data.device_data.mqtt_keepalive
					this.$data.device_info.mqtt_is_bigiot = false
					this.$data.device_info.mqtt_bigiot_username = test_data.device_data.mqtt_bigiot_username
					this.$data.device_info.mqtt_client_id = test_data.device_data.mqtt_client_id
					this.$data.device_info.mqtt_username = test_data.device_data.mqtt_username
					this.$data.device_info.mqtt_password = test_data.device_data.mqtt_password
					this.$data.device_info.websocket_port = test_data.device_data.websocket_port
					this.$data.device_info.websocket_path = test_data.device_data.websocket_path
				} else {
					console.log("device modify");
					this.$data.device_info = item;
				}
			},
			switch_to_bigiot (event) {
				this.$data.is_bigiot_server = event.target.value;
				this.$data.device_info.mqtt_is_bigiot = event.target.value;
			},
			button_test_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log("form info: ", result);
					// #ifdef APP-PLUS
					wifi_handler.connect(this.$data.device_info.ssid);
					// #endif
					this.start_test_websocket_client();
				}).catch(error => {
					console.log("form error: ", error);
				})
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log("form info: ", result);

					this.start_save_websocket_client();
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
			start_save_websocket_client () {
				var that = this;
				// #ifdef APP-PLUS
				var host_ip = wifi_handler.get_dhcp_info()['gateway'];
				// #endif
				
				// #ifndef APP-PLUS
				var host_ip = "localhost";
				// #endif
				
				uni.showLoading({
					title: "请稍候...",
					mask: true
				});
				
				uni.closeSocket();
				
				var websocket = uni.connectSocket({
					url: "ws://"  + host_ip + ":" + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path,
					success () {
						console.log("websocket completed");
					}
				});
				
				websocket.onOpen(function (res){
					console.log("websocket opened");
					
					var params = {
						command: "save_settings",
						wifi_ssid: that.$data.device_info.wifi_ssid,
						wifi_password: that.$data.device_info.wifi_password,
						mqtt_host: that.$data.device_info.mqtt_host,
						mqtt_port: that.$data.device_info.mqtt_port,
						mqtt_keepalive: that.$data.device_info.mqtt_keepalive,
						mqtt_bigiot_username: that.$data.device_info.mqtt_bigiot_username,
						mqtt_is_bigiot: that.$data.device_info.mqtt_is_bigiot,
						mqtt_client_id: that.$data.device_info.mqtt_client_id,
						mqtt_username: that.$data.device_info.mqtt_username,
						mqtt_password: that.$data.device_info.mqtt_password,
					};
					
					websocket.send({
						data: JSON.stringify(params)
					});
				});
				
				websocket.onError(function (res){
					console.log("websocket error:", res);
					uni.hideLoading();
				});
				
				websocket.onMessage(function (res) {
					const result = JSON.parse(res.data);
					console.log("websocket message:", result);
					
					switch (result.command) {
						case 'save_settings_result':
							if (result.result === 'success') {
								var params = {
									command: "reboot_device",
								};
								
								websocket.send({
									data: JSON.stringify(params)
								});

								settings_handler.save_device_item(that.$data.device_info);

								uni.hideLoading();
								websocket.close();
								
								uni.navigateBack({
									delta: 2,
								});
								
								that.$data.event_channel.emit('acceptDataFromOpenedPage', 'device_added');
							}
							break;
						default:
							uni.hideLoading();
							that.show_popup_message(`Unknown command: ${result.command}`);
					}
				});
				
				websocket.onClose(function (res){
					uni.hideLoading();
					console.log("websocket closed");
					// that.show_popup_message("WebSocket Closed");
				});
			},
			start_test_websocket_client () {
				var that = this;
				// #ifdef APP-PLUS
				var host_ip = wifi_handler.get_dhcp_info()['gateway'];
				// #endif
				
				// #ifndef APP-PLUS
				var host_ip = "localhost";
				// #endif
				
				uni.showLoading({
					title: "请稍候...",
					mask: true
				});
				
				uni.closeSocket();
				
				// console.log("host: ws://" + host_ip + ":" + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path);
				var websocket = uni.connectSocket({
					url: "ws://" + host_ip + ":" + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path,
					success () {
						console.log("websocket completed");
					}
				});
				
				websocket.onOpen(function (res){
					console.log("websocket opened");
					
					var params = {
						command: "identity",
					};
					
					websocket.send({
						data: JSON.stringify(params)
					});
				});
				
				websocket.onError(function (res){
					console.log("websocket error:", res);
					uni.hideLoading();
				});
				
				websocket.onMessage(function (res){
					const result = JSON.parse(res.data);
					console.log("websocket message:", result);
					
					switch (result.command) {
						case 'identity_result':
							if (result.result === 'success') {
								if (that.$data.device_info.bssid.replace(new RegExp(':', 'g'), '') === result.mac_address.toLowerCase()) {
									that.$data.device_info.hardware_name = result.hardware_name;
									that.$data.device_info.hardware_version = result.hardware_version;
									
									var params = {
										command: "check_wifi",
										wifi_ssid: that.$data.device_info.wifi_ssid,
										wifi_password: that.$data.device_info.wifi_password,
									};
									
									websocket.send({
										data: JSON.stringify(params)
									});
								} else {
									uni.hideLoading();
									websocket.close();
									that.show_popup_message('Device mac address not match');
								}
							}
							break;
						case 'check_wifi_result':
							if (result.result_code === 1010) {
								// keep going
							} else {
								console.log("Device check wifi failed");
								
								uni.hideLoading();
								websocket.close();
								that.show_popup_message("Device check wifi failed");
							}
							break;
						case 'check_internet_result':
							if (result.result === 'success') {
								var params = {
									command: "check_mqtt",
									client_id: that.$data.device_info.mqtt_client_id,
									host: that.$data.device_info.mqtt_host,
									port: that.$data.device_info.mqtt_port,
									is_bigiot: that.$data.device_info.mqtt_is_bigiot,
									bigiot_username: that.$data.device_info.mqtt_bigiot_username,
									username: that.$data.device_info.mqtt_username,
									password: that.$data.device_info.mqtt_password,
									keepalive: that.$data.device_info.mqtt_keepalive,
								};
								
								websocket.send({
									data: JSON.stringify(params)
								});
							} else {
								uni.hideLoading();
								websocket.close();
								that.show_popup_message("Device check internet failed");
							}
							break;
						case 'check_mqtt_result':
							if (result.result === 'success') {
								uni.hideLoading();
								websocket.close();
								that.show_popup_message("测试成功，请保存设置", "success");
							} else {
								uni.hideLoading();
								websocket.close();
								that.show_popup_message("Device check mqtt failed: " + result.error_msg)
							}
							break;
						default:
							uni.hideLoading();
							that.show_popup_message(`Unknown command: ${result.command}`);
					}
				});
				
				websocket.onClose(function (res){
					console.log("websocket closed");
					// that.show_popup_message("WebSocket Closed");
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