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
		<view>
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
					</uni-list>
					<uni-list :border="false">
						<uni-list-item
							title="设置"
							:showExtraIcon="true"
							:extraIcon="{size: '22',type: 'settings'}"
							clickable
							@click="open_page('../settings/settings')"
							style="border-top: 1px solid #c8c7cc;" />
					</uni-list>
					<uni-list :border="false">
						<uni-list-item
							title="查看数据点"
							:showExtraIcon="true"
							:extraIcon="{size: '22',type: 'eye'}"
							clickable
							@click="open_page('../data/data')"
							style="border-top: 1px solid #c8c7cc;" />
					</uni-list>
					<uni-list :border="false">
						<uni-list-item />
					</uni-list>
					<uni-list :border="false">
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
		
<!-- 		<view>
			<uni-card
				v-for="(device, index) in device_list"
				:key="index"
				:title="device.hardware_name + (device.hardware_memo !== undefined && device.hardware_memo !== '' ? ' (' + device.hardware_memo + ')' : '') || device.ssid"
				:isShadow="true"
				extra=""
				note=""
				mode="title"
				thumbnail="/static/icons/device.png">
				<uni-swipe-action>
					<uni-list
						v-for="(pc, index) in pc_list"
						:key="index"
						:border="false">
						<uni-swipe-action-item>
							<uni-list-item
								v-if="pc.assigned_device === device.id"
								:title="pc.title"
								:note="'mac: ' + pc.mac_address"
								clickable
								:disabled="!mqtt_status"
								thumb="/static/icons/pc.png"
								thumbSize="base"
								style="border: none; width: 100%;" />
						</uni-swipe-action-item>
					</uni-list>
				</uni-swipe-action>
				<template v-slot:footer>
					<view style="color: #ff0000; display: flex; float: right;">
						<view>全部唤醒</view>
					</view>
				</template>
			</uni-card>
		</view>
		
		<view>
			<uni-card
				title="未分类"
				extra=""
				note="未分类 PC 将通过所有设备进行唤醒"
				:isShadow="true">
				<uni-swipe-action>
					<uni-list
						v-for="(pc, index) in pc_list"
						:index="index"
						:border="false">
						<uni-swipe-action-item :rightOptions="swipe_options">
							<uni-list-item
								v-if="pc.assigned_device === undefined || pc.assigned_device === ''"
								:title="pc.title"
								:note="pc.mac_address"
								clickable
								:disabled="!mqtt_status"
								thumb="/static/icons/pc.png"
								thumbSize="base"
								style="border: none; width: 100%;" />
						</uni-swipe-action-item>
					</uni-list>
				</uni-swipe-action>
			</uni-card>
		</view> -->
		
		<view>
			<uni-swipe-action>
				<uni-list
					v-for="(item, index) in pc_list"
					:key="index"
					:border="false">
					<uni-swipe-action-item
						:rightOptions="swipe_options"
						@click="swipe_click($event, index, item)">
						<uni-list-item
							clickable
							:disabled="!mqtt_status"
							thumb="/static/icons/pc.png"
							thumbSize="base"
							:title="item.title"
							:note="'mac: ' + item.mac_address"
							style="border: none; width: 100%;"
							@click="pc_item_click(item)" />
					</uni-swipe-action-item>
				</uni-list>
			</uni-swipe-action>
		</view>
		
		<view>
			<uni-fab
				:pattern="fab_settings.pattern"
				:content = "fab_settings.content"
				:horizontal="fab_settings.horizontal"
				:vertical="fab_settings.bottom"
				:direction="fab_settings.direction"
				@trigger="fab_trigger"
				:popMenu="true" />
		</view>
	</view>
</template>
<script>
	import settings_handler from '@/common/settings_handler.js'
	import mqtt from '@/common/mqtt.min.js'
	
	var mqtt_client = null;
	
	export default {
		data() {
			return {
				mqtt_status: false,
				swipe_options: [
					{
						text: '删除',
						style: {
							backgroundColor: '#ff0000'
						}
					},
					{
						text: '编辑',
						style: {
							backgroundColor: '#00aa00'
						}
					}
				],
				pc_list: {},
				device_list: {},
				app_settings: {},
				fab_settings: {
					horizontal: 'right',
					vertical: 'bottom',
					direction: 'vertical',
					content: [
						{
							text: '手动输入',
							iconPath: "/static/icons/input.png",
						},
						{
							text: '导入',
							iconPath: "/static/icons/import.png",
						},
						{
							text: '扫描',
							iconPath: "/static/icons/search.png",
						},
					],
					pattern: {
						// color: '#ff0000',
						buttonColor: "#1e88e5",
						// backgroundColor: "#ff0000"
					}
				}
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
			this.$data.device_list = settings_handler.load_device_items()
			this.reload_page()
			this.start_mqtt_client()
			
			uni.$on('app_settings_update', () => {
				this.$data.app_settings = settings_handler.load_app_settings()
				this.start_mqtt_client()
			})
			
			uni.$on('app_settings_validate', () => {
				// 设置页面进行 mqtt 验证的时候需要暂时结束本页面 mqtt 连接
				this.end_mqtt_client()
			})
			
			uni.$on('pc_items_update', () => {
				this.reload_page()
			})
			
			uni.$on('device_remove', (device) => {
				let msg_obj = {},
					publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')

				msg_obj.command = 'device_remove'
				msg_obj.title = encodeURIComponent(device.title || device.ssid)
				msg_obj.mac = device.bssid.replace(new RegExp(':', 'g'), '')
				
				if (mqtt_client) {
					mqtt_client.publish(
						publish_topic,
						JSON.stringify(msg_obj)
					)	
				}
			})
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			// #endif
			
			//settings_handler.update_device_item_status('246f289da321', true)
		},
		methods: {
			pc_item_click (item) {
				// wake up pc
				if (this.$data.mqtt_status) {
					const device_items = settings_handler.load_device_items()
					
					device_items.forEach((device, index) => {
						let msg_obj = {},
							publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')
						// 00:11:32:2C:A6:03
						msg_obj.command = 'wake_up_pc'
						msg_obj.title = encodeURIComponent(item.title)
						msg_obj.mac = item.mac_address
						
						mqtt_client.publish(
							publish_topic,
							JSON.stringify(msg_obj)
						)
					})
				}
			},
			reload_page () {
				this.$data.pc_list = settings_handler.load_pc_items()
			},
			// event: 滑动按钮事件，event.index：滑动后按钮索引
			// index：list item 索引
			// item：点击的 list item
			swipe_click (event, index, item) {
				if (event.index === 0) {
					const id = item.id,
						title = item.title
								
					uni.showModal({
						content: `是否删除 ${title}？`,
						confirmText: '删除',
						success: (result) => {
							if (result.confirm) {
								settings_handler.remove_pc_item(id)
								this.reload_page()
							}
						}
					})
				} else {
					console.log('modify pc item ' + index)
					uni.navigateTo({
						url: 'computer_detail?modify=1&item=' + encodeURIComponent(JSON.stringify(item)),
						animationType: "slide-in-right"
					})
				}
			},
			fab_trigger (event) {
				if (event.index === 0) {
					uni.navigateTo({
						url: 'computer_detail?modify=0&item={}',
						animationType: "slide-in-right"
					})
				}
			},
			open_add_page () {
				uni.navigateTo({
					url: 'commputer_add'
				})
			},
			mqtt_query (topic, command) {
				
			},
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
						case 'wake_up_pc_result':
							if (msg_obj.result === 'success') {
								uni.showToast({
									title: `${json_obj.title} 已唤醒`,
									icon: 'none',
									duration: 3000
								})
							}
							break
						case 'device_remove_result':
							if (msg_obj.result === 'success') {
								uni.showToast({
									title: `${json_obj.title} 已删除`,
									icon: 'none',
									duration: 3000
								})
							}
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
				
				this.$data.mqtt_status = status
			},
			open_page (url) {
				uni.navigateTo({
					url: url,
					animationType: "slide-in-right"
				})
				
				this.$refs.drawer.close()
			},
			start_mqtt_client () {
				const settings = this.$data.app_settings
				
				if (Object.keys(settings).length === 0) {return}
				
				this.end_mqtt_client()
				
				let mqtt_topic = settings.mqtt_topic_prefix + '/remote_wol_device/+',
					options = {
						keepalive: parseInt(settings.mqtt_keepalive),
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
/* 	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	} */
</style>
