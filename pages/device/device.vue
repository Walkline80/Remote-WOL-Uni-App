<template>
	<view>
		<view class="">
			<uni-forms :value="device_info" ref="form" :rules="rules">
				<uni-group title="硬件信息" top=0>
					<view>{{device_info.ssid}} ({{device_info.bssid}})</view>
				</uni-group>
				<uni-group title="设置 WIFI" top=0>
					<uni-forms-item required label="名称" name="wifi_ssid" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="text" v-model="device_info.wifi_ssid" />
					</uni-forms-item>
					<uni-forms-item required label="密码" name="wifi_password" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="password" v-model="device_info.wifi_password" />
					</uni-forms-item>
				</uni-group>
				<uni-group title="设置 MQTT" top=0>
					<uni-forms-item required name="mqtt_host" label="服务器" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="text" value="47.102.44.223" v-model="device_info.mqtt_host" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_port" label="端口" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="text" value="1883" v-model="device_info.mqtt_port" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_client_id" label="客户端 ID" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="text" v-model="device_info.mqtt_client_id" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_username" label="用户名" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="text" v-model="device_info.mqtt_username" />
					</uni-forms-item>
					<uni-forms-item required name="mqtt_password" label="密码" :labelWidth=label_width :labelAlign=label_align>
						<uni-easyinput type="password" v-model="device_info.mqtt_password" />
					</uni-forms-item>
				</uni-group>
				
				<view class="button-group">
					<button style="width: 50%;" type="primary" @click="button_test_click()">测试</button>
					<button style="width: 30%;" type="warn" @click="button_save_click()">保存</button>
				</view>
			</uni-forms>
	    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
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
			const item = this.DEV ? JSON.parse('{"id":0,"ssid":"zysa-2.4G","bssid":"d0:76:e7:10:04:3b","level":-37}') : JSON.parse(decodeURIComponent(options.item))
			const event_channel = this.getOpenerEventChannel()
			
			// event_channel.emit('acceptDataFromOpenedPage', "feedback")
			this.$data.device_info = item
			this.$data.event_channel = event_channel
		},
		methods: {
			button_test_click (form) {
				this.$refs.form.submit().then(result => {
					console.log("form info: ", result);
				}).catch(error => {
					console.log("form error: ", error);
				})
			},
			button_save_click (form) {
				this.$refs.form.submit().then(result => {
					console.log("form info: ", result);
				}).catch(error => {
					console.log("form error: ", error);
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
