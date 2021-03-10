/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

// #ifdef APP-PLUS
plus.android.importClass('java.util.List')
plus.android.importClass('java.util.ArrayList')
plus.android.importClass('android.net.wifi.WifiManager')
// plus.android.importClass('android.net.wifi.ScanResult')
// plus.android.importClass('android.net.wifi.WifiInfo')
// plus.android.importClass('android.net.DhcpInfo')

const PERMISSIONS = [
	'android.permission.ACCESS_FINE_LOCATION',
	'android.permission.ACCESS_COARSE_LOCATION',
	'android.permission.ACCESS_WIFI_STATE',
	'android.permission.ACCESS_NETWORK_STATE',
	'android.permission.CHANGE_WIFI_STATE'
]

const MainActivity = plus.android.runtimeMainActivity(),
	Context = plus.android.importClass('android.content.Context'),
	wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE)
// var WifiConfiguration = plus.android.importClass('android.net.wifi.WifiConfiguration')

/**
 * 请求获取所需系统权限
 */
function grant_wifi_permission() {
	plus.android.requestPermissions(PERMISSIONS, result => {
		if (result.granted.length > 0) {
			console.log('permission granted', result.granted.toString())
		}
	}, error => {
		console.error(JSON.stringify(error))
	})
}

/**
 * 检查手机 wifi 功能是否开启
 * 
 * @return {boolean}
 */
function is_wifi_enabled() {
	return wifiManager.isWifiEnabled()
}

/**
 * 开启/关闭 手机 wifi 功能
 * 
 * @param {boolean} enabled - 启用或禁用
 */
function set_wifi_enabled(enabled) {
	wifiManager.setWifiEnabled(enabled)
}

/**
 * 查找指定 wifi 的配置参数
 * 
 * @param {string} ssid - 需要查找的 wifi 热点名称
 * @return {object} 如果查找到则返回配置参数实例对象，否则返回 null
 */
function is_wifi_config_exist(ssid) {
	let configs = wifiManager.getConfiguredNetworks()

	for (let count = 0; count < configs.size(); count++) {
		let config = configs.get(count)
		
		if (config.plusGetAttribute('SSID') === '\"' + ssid + '\"') {return config}
	}
	
	return null
}

/**
 * 创建并设置 WifiConfiguration 实例，用于连接 wifi 热点
 * 
 * @param {string} ssid - 需要连接的 wifi 热点名称
 * @return {object}
 */
function create_wifi_config(ssid) {
	let config = plus.android.newObject('android.net.wifi.WifiConfiguration')
	let bit_set = plus.android.newObject('java.util.BitSet')
	
	plus.android.invoke(bit_set, 'clear')
	config.plusSetAttribute('allowedAuthAlgorithms', bit_set)
	config.plusSetAttribute('allowedGroupCiphers', bit_set)
	config.plusSetAttribute('allowedKeyManagement', bit_set)
	config.plusSetAttribute('allowedPairwiseCiphers', bit_set)
	config.plusSetAttribute('allowedProtocols', bit_set)
	config.plusSetAttribute('SSID', '\"' + ssid + '\"')
	
	plus.android.invoke(bit_set, 'set', 0)
	config.plusSetAttribute('allowedKeyManagement', bit_set)

	remove_last_wifi_config(ssid)

	return config
}

/**
 * 删除指定的 wifi 热点
 * 
 * @param {string} ssid - 需要删除的 wifi 热点名称
 */
const remove_last_wifi_config = ssid => {
	const last_config = is_wifi_config_exist(ssid)
	
	if (last_config) {
		console.log('remove network ' + last_config.plusGetAttribute('SSID') + ': ' + wifiManager.removeNetwork(last_config.plusGetAttribute('networkId')))
	}
}

/**
 * 连接到指定的 wifi 热点
 * 
 * @param {string} ssid - 需要连接的 wifi 热点名称
 * @return {boolean}
 */
function connect(ssid) {
	turn_on_wifi()
	
	const network_id = wifiManager.addNetwork(create_wifi_config(ssid))
	console.log('new network id', network_id)
	
	if (network_id !== -1) {
		const enabled = wifiManager.enableNetwork(network_id, true)
		
		if (enabled) {
			sleep(1000)
			return true
		} else {
			console.log('enable network failed')
		}
	} else {
		console.log('add network failed')
	}
	
	return false
}

/**
 * 断开当前已连接的 wifi 热点
 * 
 * @return {boolean}
 */
function disconnect() {
	return wifiManager.disconnect()
}

/**
 * 获取当前设备 dhcp 信息（通过 getDhcpInfo）
 * 
 * @return {object} 返回获取到的 dhcp 信息，否则返回 null
 */
function get_dhcp_info() {
	turn_on_wifi()
	sleep(1000)
	
	const info = wifiManager.getDhcpInfo()
	let json_result = new Object()

	if (info.plusGetAttribute('ipAddress') === 0) {return json_result}

	json_result['ip'] = ip_to_string(info.plusGetAttribute('ipAddress'))
	json_result['mask'] = ip_to_string(info.plusGetAttribute('netmask'))
	json_result['gateway'] = ip_to_string(info.plusGetAttribute('gateway'))
	json_result['server'] = ip_to_string(info.plusGetAttribute('serverAddress'))
	json_result['dns1'] = ip_to_string(info.plusGetAttribute('dns1'))
	json_result['dns2'] = ip_to_string(info.plusGetAttribute('dns2'))
	
	sleep()
	return json_result
}

/**
 * 获取当前设备 ip 地址（通过 getConnectionInfo）
 * 
 * @return {String} 返回获取到的 ip 地址，否则返回 null
 */
const get_ip_address = () => {
	turn_on_wifi()
	sleep()
	
	const info = wifiManager.getConnectionInfo(),
		state = plus.android.invoke(info, 'getSupplicantState')

	if (state.toString() === 'COMPLETED') {
		const ip_address = plus.android.invoke(info, 'getIpAddress')

		if (ip_address === 0) {return null}
		
		return ip_to_string(ip_address)
	} else {
		console.log('get info not completed')
	}
	
	return null
}

/**
 * 扫描附近的 wifi 热点
 * 
 * @return {array}
 */
function scan_wifi() {
	turn_on_wifi()
	wifiManager.startScan()
	sleep(2000)

	const results = wifiManager.getScanResults()
	let lists = []

	for (let count = 0; count < results.size(); count++) {
		let obj = results.get(count)

		lists.push({
			index: count,
			ssid: obj.plusGetAttribute('SSID') !== '' ? obj.plusGetAttribute('SSID') : '(empty)',
			bssid: obj.plusGetAttribute('BSSID'),
			level: obj.plusGetAttribute('level').toString(),
			capabilities: obj.plusGetAttribute('capabilities')
		})
	}

	return lists
}

/**
 * 开启手机 wifi
 */
function turn_on_wifi() {
	if (!is_wifi_enabled()) {set_wifi_enabled(true)}
}

/**
 * 将数值型 ip 地址转换为字符串
 * 
 * @param {number} ip_address - 要转换的 ip 地址或其它网络信息数值
 * @return {string}
 */
function ip_to_string(ip_address) {
	return `${ip_address & 0xff}.${ip_address >> 8 & 0xff}.${ip_address >> 16 & 0xff}.${ip_address >> 24 & 0xff}`
}

/**
 * 系统延时指定的时间
 * 
 * @param {number} duration - 延时时长，单位 毫秒，默认值 500
 */
function sleep(duration=500) {
	const time = Number(new Date())
	while (time + duration > Number(new Date())) {}
}

export default {
	grant_wifi_permission,
	scan_wifi,
	is_wifi_enabled,
	set_wifi_enabled,
	// is_wifi_config_exist,
	// create_wifi_config,
	// sleep,
	// ip_to_string,
	// turn_on_wifi,
	connect,
	disconnect,
	get_ip_address,
	get_dhcp_info,
	remove_last_wifi_config
}
// #endif