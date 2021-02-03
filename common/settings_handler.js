/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

const settings_filename = 'remote_wol_config.json'
const app_settings_prefix = 'remote_wol_app_'
const device_item_prefix = 'remote_wol_device_'

var save_app_settings = function (data) {
	
};

var load_app_settings = function () {
	
};

var save_device_item = function (item) {
	var device_id_suffix = item.bssid;
	var result = true;
	
	item.id = device_item_prefix + item.bssid;
	
	uni.setStorage({
		key: item.id,
		data: item,
		success: () => {
		},
		fail: () => {
			result = false;
		}
	});
	
	return result;
};

var load_device_items = function () {
	var items = [];
	
	uni.getStorageInfo({
		success: (result) => {
			result.keys.forEach(function (key, index) {
				if (key.startsWith(device_item_prefix)) {
					uni.getStorage({
						key: key,
						success: (result) => {
							items.push(result.data)
						},
						fail: () => {
						}
					});
				}
			});
		},
		fail: () => {
		}
	});
	
	return items;
};

var remove_device_item = function (key) {
	uni.removeStorage({
		key: key,
		success: () => {
		},
		fail: () => {
		}
	});
}

export default {
	save_app_settings,
	load_app_settings,
	save_device_item,
	load_device_items,
	remove_device_item
}