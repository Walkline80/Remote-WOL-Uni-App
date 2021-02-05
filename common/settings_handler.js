/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

const settings_filename = 'remote_wol_config.json'
const app_settings_key = 'remote_wol_app_settings'
const device_item_prefix = 'remote_wol_device_'

var save_app_settings = function (settings) {
	var result = true;
	
	uni.setStorage({
		key: app_settings_key,
		data: settings,
		success: () => {
		},
		fail: () => {
			result = false;
		}
	});
	
	return result;
};

var load_app_settings = function () {
	var settings = {};
	
	try {
		const info = uni.getStorageInfoSync();
		
		info.keys.forEach(function (key, index) {
			if (key === app_settings_key) {
				const item = uni.getStorageSync(key);
				settings = item;
			}
		});
	} catch (e) {
		console.log("load_app_setting error", e);
	}

	// uni.getStorageInfo({
	// 	success: (result) => {
	// 		result.keys.forEach(function (key, index) {
	// 			if (key.startsWith(app_settings_key)) {
	// 				uni.getStorage({
	// 					key: key,
	// 					success: (result) => {
	// 						settings = result.data
	// 					},
	// 					fail: () => {
	// 					}
	// 				});
	// 			}
	// 		});
	// 	},
	// 	fail: () => {
	// 	}
	// });
	
	return settings;
};

var save_device_item = function (item) {
	var device_id_suffix = item.bssid;
	var result = true;
	
	item.id = device_item_prefix + item.bssid;
	
	uni.setStorage({
		key: item.id,
		data: item,
		success: () => {},
		fail: () => {
			result = false;
		}
	});
	
	return result;
};

var load_device_items = function () {
	var items = [];
	
	try {
		const info = uni.getStorageInfoSync();
		
		info.keys.forEach(function (key, index) {
			if (key.startsWith(device_item_prefix)) {
				const item = uni.getStorageSync(key);
				items.push(item);
			}
		});
	} catch (e) {
		console.log("load_device_items error", e);
	}
	
	// uni.getStorageInfo({
	// 	success: (result) => {
	// 		result.keys.forEach(function (key, index) {
	// 			if (key.startsWith(device_item_prefix)) {
	// 				uni.getStorage({
	// 					key: key,
	// 					success: (result) => {
	// 						items.push(result.data)
	// 						console.log(items);
	// 					},
	// 					fail: () => {
	// 					}
	// 				});
	// 			}
	// 		});
	// 	},
	// 	fail: () => {
	// 	}
	// });
	
	return items;
};

var remove_device_item = function (key) {
	uni.removeStorage({
		key: key,
		success: () => {},
		fail: () => {}
	});
}

var remove_app_settings = function () {
	uni.removeStorage({
		key: app_settings_key,
		success: () => {},
		fail: () => {}
	});
}

export default {
	save_app_settings,
	load_app_settings,
	save_device_item,
	load_device_items,
	remove_device_item,
	remove_app_settings
}