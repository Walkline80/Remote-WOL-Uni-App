<!--
/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */
-->

<template>
	<view class="content" @touchend="touchend_event" style="height: 100%;">
		<view>
			<uni-drawer
				ref="drawer"
				:width="260"
				:mask="true"
				:maskClick="true"
				mode="left">
				<view class="drawer_header">
					<image src="@/static/header.png" mode="aspectFill"></image>
					<text class="drawer_title">Remote WOL</text>
					<text class="drawer_version">v{{version}}</text>
				</view>
				<!-- <uni-group :title="'Remote WOL v' + version" top=0> -->
				<uni-list :border="false">
					<uni-list-item
						title="硬件列表"
						note="硬件设备管理"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'list'}"
						clickable
						@click="open_page('../device/device_manage')">
					</uni-list-item>
					<uni-list-item
						title="设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'settings'}"
						clickable
						@click="open_page('../settings/settings')">
					</uni-list-item>
					<uni-list-item
						title="查看数据点"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'eye'}"
						clickable
						@click="open_page('../webview/data_point')">
					</uni-list-item>
					<uni-list-item
						title="更新记录"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'compose'}"
						clickable
						@click="open_page('../webview/changelog')">
					</uni-list-item>
					<uni-list-item
						title="导入/导出设置"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'redo'}"
						clickable
						@click="show_action_sheet">
					</uni-list-item>
				</uni-list>
				
				<view class="gap-lg" style="background-color: white;"></view>
				
				<uni-list :border="false">
					<uni-list-item
						title="关于"
						:showExtraIcon="true"
						:extraIcon="{size: '22',type: 'info'}"
						clickable
						@click="open_page('../about/about')">
					</uni-list-item>
				</uni-list>
				<!-- </uni-group> -->
			</uni-drawer>
		</view>

		<view class="groups"
			v-for="(device, index) in device_list"
			:key="index">
			<view class="group-item">
				<text style="font-size: 14px;">
					{{device.hardware_memo ? device.hardware_memo : (device.hardware_name + ' (' + device.bssid + ')')}}
					<text class="uni-badge">{{group_counter[index]}}</text>
				</text>
				<button
					size="mini"
					type="primary"
					plain
					:disabled="!(device.status && mqtt_status)"
					@click="group_wakeup(device)">唤醒</button>
			</view>

			<view>
				<uni-list
					v-if="pc_list_grouped.length > 0"
					:border="false">
					<uni-swipe-action ref="swipe_groups">
						<uni-swipe-action-item
							v-for="(pc, index) in pc_list_grouped"
							:key="pc.id"
							v-if="pc.group === device.id"
							:leftOptions="left_swipe_options"
							:rightOptions="right_swipe_options"
							@click="swipe_click($event, index, pc)">
							<uni-list-item
								clickable
								:disabled="!(device.status && mqtt_status)"
								thumb="/static/icons/pc.png"
								thumbSize="base"
								:title="pc.title"
								:note="'mac: ' + pc.mac_address"
								@click="pc_item_click(pc, device)">
							</uni-list-item>
						</uni-swipe-action-item>
					</uni-swipe-action>
				</uni-list>
			</view>
			<view class="gap"></view>
		</view>
		
		<view class="gap"
			v-if="device_list.length > 0"></view>

		<view class="ungroups">
			<uni-list
				v-if="pc_list_ungroup.length > 0"
				:border="false">
				<uni-swipe-action ref="swipe_ungroups">
					<uni-swipe-action-item
						v-for="(pc, index) in pc_list_ungroup"
						:key="pc.id"
						:leftOptions="left_swipe_options"
						:rightOptions="right_swipe_options"
						@click="swipe_click($event, index, pc)">
						<uni-list-item
							clickable
							:disabled="!mqtt_status"
							thumb="/static/icons/pc.png"
							thumbSize="base"
							:title="pc.title"
							:note="'mac: ' + pc.mac_address"
							@longpress="show_action_sheet(pc)"
							@click="pc_item_click(pc)">
						</uni-list-item>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</uni-list>
		</view>

		<view>
			<uni-fab
				id="fab"
				ref="fab"
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
	import update_handler from '@/common/update_handler.js'
	import io_handler from '@/common/io_handler.js'
	import mqtt from '@/common/mqtt.min.js'

	let mqtt_client = null

	export default {
		data() {
			return {
				version: '',
				mqtt_status: false,
				left_swipe_options: [
					{
						text: '删除',
						style: {
							backgroundColor: '#ff0000'
						}
					}
				],
				right_swipe_options: [
					{
						text: '编辑',
						style: {
							backgroundColor: '#00aa00'
						}
					}
				],
				group_counter: [],
				pc_list: {},
				pc_list_grouped: {},
				pc_list_ungroup: {},
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
		onNavigationBarButtonTap(event) {
			// search button click event
			if (event.index === 0) {
				this.$refs.drawer.showDrawer ? this.$refs.drawer.close() : this.$refs.drawer.open()
			}
		},
		onUnload() {
			this.end_mqtt_client()
		},
		onShow() {
			this.reload_page()
		},
		onLoad(options) {
			// #ifdef APP-PLUS
			plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
				this.$data.version = wgtinfo.version
			})
			// #endif

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
			
			uni.$on('pc_items_update', () => {
				// this.reload_page()
			})

			uni.$on('device_remove', (device) => {
				let msg_obj = {},
					publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')

				msg_obj.command = 'device_remove'
				msg_obj.title = encodeURIComponent(device.title || device.ssid)
				msg_obj.mac_address = device.bssid.replace(new RegExp(':', 'g'), '')
				
				if (mqtt_client) {
					mqtt_client.publish(
						publish_topic,
						JSON.stringify(msg_obj)
					)
				}
				
				settings_handler.remove_device_item(device.id)
			})
			
			uni.$on('device_reboot', (device) => {
				if (this.$data.mqtt_status) {
					let msg_obj = {},
						publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')
					
					msg_obj.command = 'device_reboot'
					msg_obj.mac_address = device.bssid.replace(new RegExp(':', 'g'), '')
					
					if (mqtt_client) {
						mqtt_client.publish(
							publish_topic,
							JSON.stringify(msg_obj)
						)	
					}
					
					uni.showToast({
						title: '命令已下发',
						icon: 'none',
						duration: 2000
					})
				} else {
					uni.showToast({
						title: '下发命令失败',
						icon: 'none',
						duration: 2000
					})
				}
			})
			
			uni.$on('get_device_logs', (device) => {
				if (this.$data.mqtt_status) {
					let msg_obj = {},
						publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')
					
					msg_obj.command = 'report_error_log'
					msg_obj.mac_address = device.bssid.replace(new RegExp(':', 'g'), '')
					
					if (mqtt_client) {
						mqtt_client.publish(
							publish_topic,
							JSON.stringify(msg_obj)
						)	
					}
				} else {
					uni.showToast({
						title: '下发命令失败',
						icon: 'none',
						duration: 2000
					})
				}
			})
		},
		onReady() {
			// #ifdef APP-PLUS
			this.$scope.$getAppWebview().evalJS('plus.android.invoke(plus.android.currentWebview(), "setForceDarkAllowed", false)')
			update_handler.check_update()
			// #endif

			//settings_handler.update_device_item_status('246f289da321', true)
		},
		methods: {
			touchend_event (event) {
				if (this.$refs.fab.isShow) {
					this.$refs.fab.close()
				}
			},
			show_action_sheet (item) {
				uni.showActionSheet({
					itemList: [
						'请选择一个操作',
						'从文件导入',
						'导出到文件',
						'分享文件'
					],
					success: event => {
						console.log('clicked item ' + event.tapIndex)
						
						if (event.tapIndex === 1) {
							uni.showModal({
								title: '危险操作',
								content: '导入设置会覆盖现有全部设置内容，是否继续操作？',
								confirmText: '继续',
								success: result => {
									if (result.confirm) {
										io_handler.load_settings(this.load_settings_callback)
									}
								}
							})
						} else if (event.tapIndex === 2) {
							io_handler.save_settings()
						} else if (event.tapIndex === 3) {
							io_handler.share_file()
						}
					}
				})
			},
			load_settings_callback () {
				this.$data.app_settings = settings_handler.load_app_settings()
				this.reload_page()
				this.start_mqtt_client()
			},
			wake_up_pc (pc, device) {
				if (!device.status) {return}

				let msg_obj = {},
					publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')
				// 00:11:32:2C:A6:03
										
				msg_obj.command = 'wake_up_pc'
				msg_obj.title = encodeURIComponent(pc.title)
				msg_obj.mac_address = pc.mac_address
				
				mqtt_client.publish(
					publish_topic,
					JSON.stringify(msg_obj)
				)
			},
			pc_item_click (pc, device=null) {
				// wake up pc
				if (this.$data.mqtt_status) {
					if (device) {
						console.log('waking up one pc via one device')
						this.wake_up_pc(pc, device)
					} else {
						console.log('waking up one pc via all devices');
						this.$data.device_list.forEach(device => {
							this.wake_up_pc(pc, device)
						})
					}
				} else {
					uni.showToast({
						title: '下发命令失败',
						icon: 'none',
						duration: 2000
					})
				}
			},
			group_wakeup (device) {
				if (this.$data.mqtt_status) {
					console.log('waking up group: ' + device.id)
					this.$data.pc_list.forEach(pc => {
						if (pc.group === device.id) {
							let msg_obj = {},
								publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + device.bssid.replace(new RegExp(':', 'g'), '')
							
							msg_obj.command = 'wake_up_pc'
							msg_obj.title = encodeURIComponent(pc.title)
							msg_obj.mac_address = pc.mac_address
					
							mqtt_client.publish(
								publish_topic,
								JSON.stringify(msg_obj)
							)
						}
					})
				} else {
					uni.showToast({
						title: '下发命令失败',
						icon: 'none',
						duration: 2000
					})
				}
			},
			reload_page () {
				this.$data.device_list = settings_handler.load_device_items()
				this.$data.pc_list = settings_handler.load_pc_items()
				this.$data.group_counter = []

				let grouped = [],
					ungroup = []

				// 预处理 list 数据
				if (this.$data.device_list.length > 0) {
					this.$data.device_list.forEach(device => {
						let count = 0
					
						this.$data.pc_list.forEach((pc, index) => {
							if (!pc.group) {
								if (!pc.added) {
									pc.added = true
									ungroup.push(pc)
								}
							} else if (pc.group === device.id) {
								grouped.push(pc)
								count += 1
							}
						})

						this.$data.group_counter.push(count)
					})
				} else {
					this.$data.pc_list.forEach((pc, index) => {
						ungroup.push(pc)
					})
				}

				this.$data.pc_list_grouped = grouped
				this.$data.pc_list_ungroup = ungroup
			},

			/** event: 滑动按钮事件，event.index：滑动后按钮索引
			 * index：list item 索引
			 * item：点击的 list item */
			swipe_click (event, index, item) {
				if (event.position === 'left') {
					uni.showModal({
						content: `是否删除 ${item.title}？`,
						confirmText: '删除',
						success: (result) => {
							if (result.confirm) {
								settings_handler.remove_pc_item(item.id)
								this.reload_page()
							}
						}
					})
				} else if (event.position === 'right') {
					console.log('modify pc item ' + index)
					uni.navigateTo({
						url: `computer_detail?pc_id=${item.id}`,
						animationType: "slide-in-right"
					})
				}
			},
			fab_trigger (event) {
				if (event.index === 0) {
					uni.navigateTo({
						url: 'computer_detail',
						animationType: "slide-in-right"
					})
				}
			},
			open_add_page () {
				uni.navigateTo({
					url: '../computer/computer_add',
					animationType: "slide-in-right"
				})
			},
			mqtt_on_message (topic, message) {
				console.log(`received topic: ${topic}, message: ${message.toString()}`)
				
				if (Object.keys(message).length === 0) {return}
				
				try {
					const json_obj = JSON.parse(decodeURIComponent(message))
					let msg_obj = {}
					
					if (!settings_handler.is_device_item_exist(json_obj.mac_address)) {return}

					msg_obj.command = json_obj.command
					msg_obj.result = json_obj.result
					msg_obj.mac_address = json_obj.mac_address || ''
					msg_obj.ip_address = json_obj.ip_address || '无'
					
					msg_obj.publish_topic = this.$data.app_settings.mqtt_topic_prefix + '/remote_wol_device/' + msg_obj.mac_address

					switch (msg_obj.command) {
						case 'device_status_indicator':
							settings_handler.update_device_item_status(msg_obj.mac_address, (msg_obj.result === 'online' ? true : false))
							settings_handler.update_device_item_ip_address(msg_obj.mac_address, msg_obj.ip_address)
							
							// 清除硬件设备在线状态 retain 消息 
							mqtt_client.publish(
								msg_obj.publish_topic,
								new Buffer([]),
								{retain: true},
							)
							
							// 同步当前时间到硬件设备
							if (msg_obj.result === 'online') {
								mqtt_client.publish(
									msg_obj.publish_topic,
									JSON.stringify({
										command: 'sync_datetime',
										mac_address: msg_obj.mac_address,
										datetime: this.get_datetime()
									})
								)
							}

							uni.$emit('device_status_update')
							this.reload_page()
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
						case 'sync_datetime_result':
							if (msg_obj.result === 'success') {
								console.log('device datetime synced')
							}
							break
						case 'report_error_log_result':
							if (msg_obj.result === 'success') {
								let logs = '无记录'
								
								if (json_obj.logs) {
									json_obj.logs.forEach(log=>{logs+=log})
								}

								uni.showModal({
									content: logs,
									showCancel: false
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
				if (mqtt_client) {
					mqtt_client.end({force: true})
					this.set_mqtt_indicator_status(false)
				}
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
				this.reload_page()
			},
			open_page (url) {
				uni.navigateTo({
					url: url,
					animationType: "slide-in-right"
				})
				
				this.$refs.drawer.close()
			},
			get_datetime () {
				const datetime = new Date(),
					result = {
						year: datetime.getFullYear(),
						month: datetime.getMonth() + 1,
						day: datetime.getDate(),
						// MicroPython: weekday is 0-6 for Mon-Sun
						// JS on +08: weekday is 0-6 for Sun-Sat
						weekday: datetime.getDay() === 0 ? 6 : datetime.getDay() - 1,
						hour: datetime.getHours(),
						minute: datetime.getMinutes(),
						second: datetime.getSeconds(),
						millisecond: datetime.getMilliseconds()
					}

				return result
			},
			start_mqtt_client () {
				const settings = this.$data.app_settings

				this.end_mqtt_client()
				if (Object.keys(settings).length === 0) {return}

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

				console.log('start mqtt client create');
				mqtt_client.on('connect', () => {
					console.log('mqtt connected')
					
					mqtt_client.subscribe(mqtt_topic, (error, granted) => {
						if (!error) {
							console.log('subscribe no error')
							this.set_mqtt_indicator_status(true)
						} else {
							console.log('subscribe error', error)
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
	page {
		height: 100%;
	}

	.drawer_header {
		background-color: darkcyan;
		width: 100%;
		height: 150px;
		line-height: 150px;
		vertical-align: middle;
	}
	
	.drawer_header image {
		width: 100%;
		height: 150px;
	}

	.drawer_title {
		position: fixed;
		top: 0;
		left: 0;
		font-size: 22px;
		color: white;
		width: 100%;
		margin-left: 20px;
		font-weight: bold;
		text-shadow: 2px 2px grey;
	}

	.drawer_version {
		position: fixed;
		top: 60px;
		right: 10px;
		color: gainsboro;
		font-size: 14px;
	}
	
	/* .uni-swipe .uni-list-item:not(:last-child) {
		border-top: 1rpx solid lightgrey;
		width: 100%;
	} */
	
	.groups .uni-list-item {
		/* border-top: 1rpx solid lightgrey; */
		width: 100%;
	}
	
	.ungroups .uni-list-item {
		/* border-top: 0; */
		width: 100%;
	}
	
	.groups {
		background-color: white;
	}
	
	.group-item {
		display: flex;
		height: 60rpx;
		line-height: 60rpx;
		padding: 12rpx 20rpx;
	}
	
	.group-item text {
		vertical-align: middle;
		flex: 1;
	}

	.group-item uni-text {
		vertical-align: text-bottom;
	}

	.uni-badge {
		display: inline-flex;
		box-sizing: border-box;
		overflow: hidden;
		justify-content: center;
		vertical-align: text-top!important;
		flex-direction: row;
		width: 18px;
		height: 18px;
		line-height: 18px;
		color: white;
		border-radius: 100px;
		background-color: #4cd964;
		text-align: center;
		font-family: 'Helvetica Neue', Helvetica, sans-serif;
		font-size: 12px;
		padding: 0px 6px;
		margin-left: 5px;
	}
</style>
