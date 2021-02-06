/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

const settings_filename = 'remote_wol_config.json'
const app_settings_key = 'remote_wol_app_settings'
const device_item_prefix = 'remote_wol_device_'

/**
 * 保存 app 设置
 * 
 * @param {object} settings - 要保存的设置对象
 * @return {boolean}
 */
const save_app_settings = (settings) => {
	let result = true
	
	try {
		uni.setStorageSync(app_settings_key, settings)
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
			if (key === app_settings_key) {
				const item = uni.getStorageSync(key)
				settings = item
			}
		})
	} catch (error) {
		console.log("load_app_setting error", error)
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
	
	item.id = device_item_prefix + item.bssid.replace(new RegExp(':', 'g'), '')
	
	try {
		uni.setStorageSync(item.id, item)
	} catch (error) {
		console.log('save_device_item error', error)
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
			if (key.startsWith(device_item_prefix)) {
				const item = uni.getStorageSync(key)
				items.push(item)
			}
		})
	} catch (error) {
		console.log("load_device_items error", error)
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
		item = uni.getStorageSync(device_item_prefix + key)

		if (!item) {item = {}}
	} catch (error) {
		console.log('get_device_item error', error)
	}
	
	return item
}

/**
 * 更新指定硬件设备的在线状态
 * 
 * @param {string} key - 要读取的硬件设备的 mac 地址（不包含 mac 地址分隔符）
 * @param {boolean} status - 在线状态布尔值
 */
const update_device_item_status = (key, status) => {
	let item = get_device_item(key)
	
	if (typeof(item) === 'object') {
		item.status = status
		save_device_item(item)
	}
}

/**
 * 删除指定硬件设备设置
 * 
 * @param {string} key - 要读取的硬件设备的 mac 地址（不包含 mac 地址分隔符）
 */
const remove_device_item = (key) => {
	try {
		uni.removeStorageSync(key)
	} catch (error) {
		console.log('remove_device_item error', error)
	}
}

/**
 * 删除 app 设置
 * 
 */
const remove_app_settings = () => {
	try {
		uni.removeStorageSync(app_settings_key)
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
			if (key === app_settings_key) {
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
	get_device_item
}