/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

// const settings_filename = 'remote_wol_config.json'
const APP_SETTINGS_KEY = 'remote_wol_app_settings'
const DEVICE_ITEM_PREFIX = 'remote_wol_device_'
const PC_ITEM_PREFIX = 'remote_wol_pc_'

/**
 * 保存 app 设置
 * 
 * @param {object} settings - 要保存的设置对象
 * @return {boolean}
 */
const save_app_settings = (settings) => {
	let result = true
	
	try {
		uni.setStorageSync(APP_SETTINGS_KEY, settings)
	} catch (error) {
		console.log('save_app_settings error', error)
		result = false
	}

	return result
}

/**
 * 读取 app 设置
 * 
 * @return {object} 返回 app 设置对象
 */
const load_app_settings = () => {
	let settings = {}
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key === APP_SETTINGS_KEY) {
				const item = uni.getStorageSync(key)
				settings = item
				settings.mqtt_topic_prefix = (item.mqtt_is_bigiot ? item.mqtt_bigiot_username : item.mqtt_client_id)
			}
		})
	} catch (error) {
		console.log('load_app_setting error', error)
	}

	return settings
}

/**
 * 保存硬件设备设置
 * 
 * @param {object} item - 要保存的硬件设备设置对象
 * @return {boolean}
 */
const save_device_item = (item) => {
	let result = true
	
	item.id = DEVICE_ITEM_PREFIX + item.bssid.replace(new RegExp(':', 'g'), '')
	
	try {
		uni.setStorageSync(item.id, item)
	} catch (error) {
		console.log('save_device_item error', error)
		result = false
	}
	
	return result
}

/**
 * 保存 pc 设备设置
 * 
 * @param {object} item - 要保存的 pc 设备设置对象
 * @return {boolean}
 */
const save_pc_item = (item) => {
	let result = true
	
	item.id = PC_ITEM_PREFIX + item.mac_address
	
	try {
		uni.setStorageSync(item.id, item)
	} catch (error) {
		console.log('save_pc_item error', error)
		result = false
	}
	
	return result
}

/**
 * 读取所有硬件设备设置
 * 
 * @return {array} 返回包含所有硬件设备设置的数组
 */
const load_device_items = () => {
	let items = []
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key.startsWith(DEVICE_ITEM_PREFIX)) {
				const item = uni.getStorageSync(key)
				items.push(item)
			}
		})
	} catch (error) {
		console.log('load_device_items error', error)
	}

	return items
}

/**
 * 读取所有 pc 设备设置
 * 
 * @return {array} 返回包含所有 pc 设备设置的数组
 */
const load_pc_items = () => {
	let items = []
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key.startsWith(PC_ITEM_PREFIX)) {
				const item = uni.getStorageSync(key)
				items.push(item)
			}
		})
	} catch (error) {
		console.log('load_pc_items error', error)
	}

	return items
}

/**
 * 读取指定硬件设备设置
 * 
 * @param {string} key - 要读取的硬件设备的 mac 地址（不包含 mac 地址分隔符）
 * @return {object} 返回指定的硬件设备设置
 */
const get_device_item = (key) => {
	let item = {}
	
	try {
		item = uni.getStorageSync(DEVICE_ITEM_PREFIX + key)

		if (!item) {item = null}
	} catch (error) {
		console.log('get_device_item error', error)
	}
	
	return item
}

/**
 * 读取指定 pc 设备设置
 * 
 * @param {string} key - 要读取的 pc 设备的 mac 地址（包含 mac 地址分隔符）
 * @return {object} 返回指定的 pc 设备设置
 */
const get_pc_item = (key) => {
	let item = {}
	
	try {
		item = uni.getStorageSync(PC_ITEM_PREFIX + key)

		if (!item) {item = null}
	} catch (error) {
		console.log('get_pc_item error', error)
	}
	
	return item
}

/**
 * 读取硬件设备设置数量
 * 
 * @return {int} 返回硬件设备设置总数
 */
const get_device_item_counts = () => {
	let items = []
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key.startsWith(DEVICE_ITEM_PREFIX)) {
				const item = uni.getStorageSync(key)
				items.push(item)
			}
		})
	} catch (error) {
		console.log('load_device_items error', error)
	}

	return items.length
}

/**
 * 读取 pc 设备设置数量
 * 
 * @return {int} 返回 pc 设备设置总数
 */
const get_pc_item_counts = () => {
	let items = []
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key.startsWith(PC_ITEM_PREFIX)) {
				const item = uni.getStorageSync(key)
				items.push(item)
			}
		})
	} catch (error) {
		console.log('load_pc_items error', error)
	}

	return items.length
}

/**
 * 更新指定硬件设备的在线状态
 * 
 * @param {string} key - 要读取的硬件设备的 mac 地址（不包含 mac 地址分隔符）
 * @param {boolean} status - 在线状态布尔值
 */
const update_device_item_status = (key, status) => {
	if (get_device_item_counts() === 0) {return}
	
	let item = get_device_item(key)

	if (item && typeof(item) === 'object') {
		item.status = status
		save_device_item(item)
	}
}

/**
 * 删除指定硬件设备设置
 * 
 * @param {string} key - 要删除的硬件设备的 mac 地址（不包含 mac 地址分隔符）
 */
const remove_device_item = (key) => {
	try {
		uni.removeStorageSync(key)
	} catch (error) {
		console.log('remove_device_item error', error)
	}
}

/**
 * 删除指定 pc 设备设置
 * 
 * @param {string} key - 要删除的 pc 设备的 mac 地址（包含 mac 地址分隔符）
 */
const remove_pc_item = (key) => {
	try {
		uni.removeStorageSync(key)
	} catch (error) {
		console.log('remove_pc_item error', error)
	}
}

/**
 * 删除 app 设置
 * 
 */
const remove_app_settings = () => {
	try {
		uni.removeStorageSync(APP_SETTINGS_KEY)
	} catch (error) {
		console.log('remove_app_settings error', error)
	}
}

/**
 * 判断 app 设置是否存在
 * 
 * @return {boolean}
 */
const is_app_settings_exist = () => {
	let result = false
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key === APP_SETTINGS_KEY) {
				result = true
			}
		})
	} catch (error) {
		console.log('is_app_settings_exist error', error)
	}
	
	return result
}

export default {
	save_app_settings,
	load_app_settings,
	save_device_item,
	load_device_items,
	remove_device_item,
	remove_app_settings,
	is_app_settings_exist,
	update_device_item_status,
	get_device_item,
	get_device_item_counts,
	save_pc_item,
	load_pc_items,
	get_pc_item,
	get_pc_item_counts,
	remove_pc_item
}