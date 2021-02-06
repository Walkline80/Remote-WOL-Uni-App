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
				<uni-group title="WIFI 设置" top=0>
					<uni-forms-item
						required
						label="名称"
						name="wifi_ssid"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="device_info.wifi_ssid" />
					</uni-forms-item>
					<uni-forms-item
						required
						label="密码"
						name="wifi_password"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="password"
							:inputBorder="false"
							v-model="device_info.wifi_password" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="MQTT 设置" top=0>
					<uni-forms-item
						required
						name="mqtt_host"
						label="服务器"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="device_info.mqtt_host" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_port"
						label="端口"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="1883"
							v-model="device_info.mqtt_port" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_keepalive"
						label="KeepAlive"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="120"
							v-model="device_info.mqtt_keepalive" />
					</uni-forms-item>
					<uni-forms-item
						name="mqtt_is_bigiot"
						label="扇贝物联"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<switch
							:checked="device_info.mqtt_is_bigiot"
							@change="switch_to_bigiot" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_bigiot_username"
						v-show="device_info.mqtt_is_bigiot"
						label="扇贝用户名"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="device_info.mqtt_bigiot_username" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_client_id"
						label="客户端 ID"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="device_info.mqtt_client_id" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_username"
						label="用户名"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="device_info.mqtt_username" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_password"
						label="密码"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="password"
							:inputBorder="false"
							v-model="device_info.mqtt_password" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="交互设置 (WebSocket)" top=0>
					<uni-forms-item
						required
						name="websocket_port"
						label="端口"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="80"
							v-model="device_info.websocket_port" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="websocket_path"
						label="路径"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="/control"
							v-model="device_info.websocket_path" />
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
				<uni-popup-message
					:type="popup_type"
					:message="popup_message"
					:duration="popup_duration" />
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
				popup_type: 'success',
				popup_duration: 1000,
				popup_message: '成功',
				label_width: 80,
				label_align: 'right',
				device_info: {},
				event_channel: null,
				rules: {
					wifi_ssid: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'WIFI 名称'
					},
					wifi_password: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						},{
							minLength: 8,
							message: '{label}长度不能少于8个字符'
						}],
						label: 'WIFI 密码'
					},
					mqtt_host: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'MQTT 服务器地址'
					},
					mqtt_port: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'MQTT 服务器端口'
					},
					mqtt_keepalive: {
						rules: [{
							required:  true,
							errorMessage: '{label}不能为空'
						}],
						label: 'KeepAlive'
					},
					mqtt_bigiot_username: {
						rules: [{
							required: false,
							errorMessage: '{label}不能为空'
						}],
						label: '扇贝物联用户名'
					},
					mqtt_client_id: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'MQTT 客户端 ID '
					},
					mqtt_username: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'MQTT 用户名'
					},
					mqtt_password: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'MQTT 密码'
					},
					websocket_port: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'WebSocket 端口'
					},
					websocket_path: {
						rules: [
							{
								required: true,
								errorMessage: '{label}不能为空'
							},
							{
								pattern: /^[/].*/,
								errorMessage: '{label}必须以 '/' 开头'
							}
						],
						label: 'WebSocket 路径'
					}
				}
			}
		},
		onUnload() {
			
		},
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
		methods: {
			load_device_info (options) {
				let item
				const modify = true

				if (Object.keys(options).length !== 0) {
					console.log('item data from prev page')
					item = JSON.parse(decodeURIComponent(options.item))
				} else {
					console.log('item data from current page')
					
					if (modify) {
						options.modify = '1'
						item = JSON.parse('{"ssid":"wol_246f289da321","bssid":"24:6f:28:9d:a3:21","level":-37,"wifi_ssid":"duoduohome","wifi_password":"8888888888","mqtt_host":"47.102.44.223","mqtt_port":1883,"mqtt_keepalive":120,"mqtt_is_bigiot":true,"mqtt_bigiot_username":"walkline","mqtt_client_id":"walkline_remote_wol","mqtt_username":"24","mqtt_password":"o9tkA75GL","websocket_port":"80","websocket_path":"/control","id":"remote_wol_device_24:6f:28:9d:a3:21"}')
					} else {
						options.modify = '0'
						item = JSON.parse('{"index":0,"ssid":"wol_246f289da321","bssid":"24:6f:28:9d:a3:21","level":-37}')
					}
				}

				if (options.modify === '0') {
					console.log('device append')
					
					this.$data.device_info = test_data.device_data
					
					this.$data.device_info.ssid = item.ssid
					this.$data.device_info.bssid = item.bssid
					this.$data.device_info.level = item.level
				} else {
					console.log('device modify')
					this.$data.device_info = item
				}
			},
			switch_to_bigiot (event) {
				this.$data.device_info.mqtt_is_bigiot = event.target.value
				this.$refs.form.rules.mqtt_bigiot_username.rules[0].required = event.target.value
			},
			button_test_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log('form info: ', result)
					// #ifdef APP-PLUS
					wifi_handler.connect(this.$data.device_info.ssid)
					// #endif
					
					this.start_test_websocket_client()
				}).catch(error => {
					console.log('form_mqtt error: ', error)
				})
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					// console.log('form info: ', result)

					this.start_save_websocket_client()
				}).catch(error => {
					console.log('form_others error: ', error)
				})
			},
			show_popup_message (message, type='error', duration=2000) {
				this.$data.popup_type = type
				this.$data.popup_message = message
				this.$data.popup_duration = duration
				this.$refs.popup_message.open()
			},
			start_save_websocket_client () {
				uni.showLoading({
					title: '请稍候...',
					mask: true
				})
				
				// #ifdef APP-PLUS
				const host_ip = wifi_handler.get_dhcp_info()['gateway']
				// #endif
				
				// #ifndef APP-PLUS
				const host_ip = 'localhost'
				// #endif
				
				uni.closeSocket()
				
				let websocket = uni.connectSocket({
					url: 'ws://'  + host_ip + ':' + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path,
					success () {
						console.log('websocket completed')
					}
				})
				
				websocket.onOpen((res) => {
					console.log('websocket opened')
					
					const params = {
						command: 'save_settings',
						wifi_ssid: this.$data.device_info.wifi_ssid,
						wifi_password: this.$data.device_info.wifi_password,
						mqtt_host: this.$data.device_info.mqtt_host,
						mqtt_port: this.$data.device_info.mqtt_port,
						mqtt_keepalive: this.$data.device_info.mqtt_keepalive,
						mqtt_bigiot_username: this.$data.device_info.mqtt_bigiot_username,
						mqtt_is_bigiot: this.$data.device_info.mqtt_is_bigiot,
						mqtt_client_id: this.$data.device_info.mqtt_client_id,
						mqtt_username: this.$data.device_info.mqtt_username,
						mqtt_password: this.$data.device_info.mqtt_password,
					}
					
					websocket.send({
						data: JSON.stringify(params)
					})
				})
				
				websocket.onError((res) => {
					console.log('websocket error', res)
					uni.hideLoading()
				})
				
				websocket.onMessage((res) => {
					const result = JSON.parse(res.data)
					console.log('websocket message', result)
					
					switch (result.command) {
						case 'save_settings_result':
							if (result.result === 'success') {
								const params = {
									command: 'reboot_device',
								}
								
								websocket.send({
									data: JSON.stringify(params)
								})

								settings_handler.save_device_item(this.$data.device_info)

								uni.hideLoading()
								websocket.close()
								
								uni.navigateBack({
									delta: 2,
								})
								
								this.$data.event_channel.emit('acceptDataFromOpenedPage', 'device_added')
							}
							break
						default:
							uni.hideLoading()
							that.show_popup_message(`Unknown command: ${result.command}`)
					}
				})
				
				websocket.onClose((res) => {
					uni.hideLoading()
					console.log('websocket closed')
					// this.show_popup_message('WebSocket Closed')
				})
			},
			start_test_websocket_client () {
				uni.showLoading({
					title: '请稍候...',
					mask: true
				})
				
				// #ifdef APP-PLUS
				const host_ip = wifi_handler.get_dhcp_info()['gateway']
				// #endif
				
				// #ifndef APP-PLUS
				const host_ip = 'localhost'
				// #endif
				
				uni.closeSocket()
				
				var websocket = uni.connectSocket({
					url: 'ws://' + host_ip + ':' + this.$data.device_info.websocket_port + this.$data.device_info.websocket_path,
					success () {
						console.log('websocket completed')
					}
				})
				
				websocket.onOpen((res) => {
					console.log('websocket opened')
					
					const params = {
						command: 'identity',
					}
					
					websocket.send({
						data: JSON.stringify(params)
					})
				})
				
				websocket.onError((res) => {
					console.log('websocket error', res)
					uni.hideLoading()
				})
				
				websocket.onMessage((res) => {
					const result = JSON.parse(res.data)
					console.log('websocket message', result)
					
					switch (result.command) {
						case 'identity_result':
							if (result.result === 'success') {
								if (this.$data.device_info.bssid.replace(new RegExp(':', 'g'), '') === result.mac_address.toLowerCase()) {
									this.$data.device_info.hardware_name = result.hardware_name
									this.$data.device_info.hardware_version = result.hardware_version
									
									const params = {
										command: 'check_wifi',
										wifi_ssid: this.$data.device_info.wifi_ssid,
										wifi_password: this.$data.device_info.wifi_password,
									}
									
									websocket.send({
										data: JSON.stringify(params)
									})
								} else {
									uni.hideLoading()
									websocket.close()
									this.show_popup_message('Device mac address not match')
								}
							}
							break
						case 'check_wifi_result':
							if (result.result_code === 1010) {
								// keep going
							} else {
								console.log('Device check wifi failed')
								
								uni.hideLoading()
								websocket.close()
								this.show_popup_message('Device check wifi failed')
							}
							break
						case 'check_internet_result':
							if (result.result === 'success') {
								const params = {
									command: 'check_mqtt',
									client_id: this.$data.device_info.mqtt_client_id,
									host: this.$data.device_info.mqtt_host,
									port: this.$data.device_info.mqtt_port,
									is_bigiot: this.$data.device_info.mqtt_is_bigiot,
									bigiot_username: this.$data.device_info.mqtt_bigiot_username,
									username: this.$data.device_info.mqtt_username,
									password: this.$data.device_info.mqtt_password,
									keepalive: this.$data.device_info.mqtt_keepalive,
								}
								
								websocket.send({
									data: JSON.stringify(params)
								})
							} else {
								uni.hideLoading()
								websocket.close()
								that.show_popup_message('Device check internet failed')
							}
							break
						case 'check_mqtt_result':
							if (result.result === 'success') {
								uni.hideLoading()
								websocket.close()
								this.show_popup_message('测试成功，请保存设置', 'success')
							} else {
								uni.hideLoading()
								websocket.close()
								that.show_popup_message('Device check mqtt failed', result.error_msg)
							}
							break
						default:
							uni.hideLoading()
							that.show_popup_message(`Unknown command: ${result.command}`)
					}
				})
				
				websocket.onClose((res) => {
					console.log('websocket closed')
					// this.show_popup_message('WebSocket Closed')
				})
			}
		}
	}
</script>

<style>
.button-group {
	display: flex;
}
</style>
