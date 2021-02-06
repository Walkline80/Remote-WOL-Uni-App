/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

const settings_filename = 'remote_wol_config.json'
const app_settings_key = 'remote_wol_app_settings'
const device_item_prefix = 'remote_wol_device_'

const save_app_settings = (settings) => {
	let result = true
	
	uni.setStorage({
		key: app_settings_key,
		data: settings,
		success: () => {
		},
		fail: () => {
			result = false
		}
	})
	
	return result
}

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
	} catch (e) {
		console.log("load_app_setting error", e)
	}

	return settings
}

const save_device_item = (item) => {
	let result = true
	
	item.id = device_item_prefix + item.bssid
	
	uni.setStorage({
		key: item.id,
		data: item,
		success: () => {},
		fail: () => {
			result = false
		}
	})
	
	return result
}

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
	} catch (e) {
		console.log("load_device_items error", e)
	}

	return items
}

const remove_device_item = (key) => {
	uni.removeStorage({
		key: key,
		success: () => {},
		fail: () => {}
	})
}

const remove_app_settings = () => {
	uni.removeStorage({
		key: app_settings_key,
		success: () => {},
		fail: () => {}
	})
}

const is_app_settings_exist = () => {
	let result = false
	
	try {
		const info = uni.getStorageInfoSync()
		
		info.keys.forEach((key) => {
			if (key === app_settings_key) {
				result = true
			}
		})
	} catch (e) {}
	
	return result
}

export default {
	save_app_settings,
	load_app_settings,
	save_device_item,
	load_device_items,
	remove_device_item,
	remove_app_settings,
	is_app_settings_exist
}