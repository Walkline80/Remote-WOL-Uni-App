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
			<uni-forms :value="settings" ref="form_mqtt" :rules="rules">
				<uni-group title="MQTT 设置" top=-10>
					<uni-forms-item
						required
						name="mqtt_host"
						label="服务器"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="settings.mqtt_host" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_port"
						label="端口"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="number"
							:inputBorder="false"
							placeholder="8083"
							v-model="settings.mqtt_port" />
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_keepalive"
						label="KeepAlive"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="number"
							:inputBorder="false"
							placeholder="30"
							v-model="settings.mqtt_keepalive" />
					</uni-forms-item>
					<uni-forms-item
						name="mqtt_is_bigiot"
						label="扇贝物联"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<switch
							:checked="settings.mqtt_is_bigiot"
							@change="switch_to_bigiot">
						</switch>
					</uni-forms-item>
					<uni-forms-item
						required
						name="mqtt_bigiot_username"
						label="扇贝用户名"
						v-show="settings.mqtt_is_bigiot"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="settings.mqtt_bigiot_username" />
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
							v-model="settings.mqtt_client_id" />
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
							v-model="settings.mqtt_username" />
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
							v-model="settings.mqtt_password" />
					</uni-forms-item>
					<view class="button-group" style="margin-top: 30rpx;">
						<button style="width: 100%;" type="primary" size="mini" @click="button_mqtt_test_click">测试 MQTT</button>
					</view>
				</uni-group>
			</uni-forms>
			<uni-forms :value="settings" ref="form_others" :rules="rules">
				<uni-group title="交互设置 (WebSocket)" top=0>
					<uni-forms-item
						required
						name="websocket_port"
						label="端口"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="number"
							:inputBorder="false"
							placeholder="80"
							v-model="settings.websocket_port" />
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
							v-model="settings.websocket_path" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="搜索设置" top=0>
					<uni-forms-item
						required
						label="WIFI 前缀"
						name="interaction_ssid_prefix"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							placeholder="wol_"
							v-model="settings.interaction_ssid_prefix" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="数据点查看设置" top=0>
					<uni-forms-item
						label="URL"
						name="data_point_url"
						:labelWidth="label_width"
						:labelAlign="label_align">
						<uni-easyinput
							type="text"
							:inputBorder="false"
							v-model="settings.data_point_url" />
					</uni-forms-item>
				</uni-group>
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
	import test_data from '@/others/device_test_data.js'
	import settings_handler from '@/common/settings_handler.js'
	import mqtt from '@/common/mqtt.min.js'
	
	var mqtt_client = null
	
	export default {
		data() {
			return {
				settings: {
					mqtt_is_bigiot: false,
					mqtt_port: 8083,
					mqtt_keepalive: 30,
					websocket_port: 80,
					websocket_path: '/control',
					interaction_ssid_prefix: 'wol_'
				},
				label_width: 80,
				label_align: 'right',
				popup_type: 'success',
				popup_duration: 1000,
				popup_message: '成功',
				rules: {
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
								errorMessage: '{label}必须以 "/" 开头'
							}
						],
						label: 'WebSocket 路径'
					},
					interaction_ssid_prefix: {
						rules: [{
							required: true,
							errorMessage: '{label}不能为空'
						}],
						label: 'WIFI 前缀'
					}
				}
			}
		},
		onNavigationBarButtonTap(e) {
			// save button click event
			if (e.index == 0) {
				uni.hideKeyboard()
				this.button_save_click()
			}
		},
		onUnload() {
			this.end_mqtt_client()
		},
		onLoad() {
			// settings_handler.remove_app_settings()
			this.load_app_settings()
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
			end_mqtt_client () {
				if (mqtt_client) {mqtt_client.end({force: true})}
			},
			show_popup_message (message, type='error', duration=3000) {
				this.$data.popup_type = type
				this.$data.popup_message = message
				this.$data.popup_duration = duration
				this.$refs.popup_message.open()
			},
			load_app_settings () {
				const settings = settings_handler.load_app_settings()
				
				if (Object.keys(settings).length === 0) {
					console.log('test data loaded')
					if (this.DEV) {this.$data.settings = test_data.app_data}
				} else {
					console.log('settings loaded')
					this.$data.settings = settings
				}
			},
			switch_to_bigiot (event) {
				this.$data.settings.mqtt_is_bigiot = event.target.value
				this.$refs.form_mqtt.rules.mqtt_bigiot_username.rules[0].required = event.target.value
			},
			button_mqtt_test_click () {
				this.validate_mqtt_settings()
				this.$refs.form_mqtt.submit().then(result => {
					// console.log('form info', result)
				}).catch(error => {
					console.log('form error', error)
				})
			},
			button_save_click () {
				this.$refs.form_mqtt.submit().then(result => {
					this.$refs.form_others.submit().then(result => {
						settings_handler.save_app_settings(this.$data.settings)
						this.show_popup_message('设置已保存', 'success', 1000)
						uni.$emit('app_settings_update')
					}).catch(error => {
						console.log('form_others error', error)
					})
				}).catch(error => {
					console.log('form_mnqtt error', error)
				})
			},
			validate_mqtt_settings() {
				const settings = this.$data.settings,
					test_topic = (settings.mqtt_is_bigiot ? settings.mqtt_bigiot_username : settings.mqtt_client_id) + '/topic/mqtt_test',
					options = {
						keepalive: parseInt(settings.mqtt_keepalive),
						clientId: settings.mqtt_client_id,
						username: settings.mqtt_username,
						password: settings.mqtt_password,
						clean: true,
						reconnectPeriod: 0,
						connectTimeout: 10 * 1000,
					}

				this.end_mqtt_client()
				uni.$emit('app_settings_validate')

				// #ifdef APP-PLUS
				mqtt_client = mqtt.connect(`wx://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options)
				// #endif
				
				// #ifdef H5
				mqtt_client = mqtt.connect(`ws://${settings.mqtt_host}:${settings.mqtt_port}/mqtt`, options)
				// #endif

				mqtt_client.on('connect', () => {
					console.log('mqtt connected')
					
					mqtt_client.subscribe(test_topic, (error, granted) => {
						if (!error) {
							console.log('no error')
							mqtt_client.publish(test_topic, 'success')
						} else {
							console.log('got error', error)
						}
					})
				}).on('reconnect', () => {
					console.log('reconnecting...')
				}).on('error', (error) => {
					console.log('on error', error)
					this.show_popup_message(error, 'error')
				}).on('message', (topic, message) => {
					console.log(`topic: ${topic}, message: ${message.toString()}`)
					
					if (topic === test_topic) {
						if (message.toString() === 'success') {
							mqtt_client.end({force: true})
							this.show_popup_message('测试成功，请保存设置', 'success')
						}
					}
				}).on('disconnect', () => {
					console.log('disconnect')
				}).on('end', () => {
					console.log('ended')
				}).on('close', () => {
					console.log('closed')
				})
			}
		}
	}
</script>

<style>

</style>
