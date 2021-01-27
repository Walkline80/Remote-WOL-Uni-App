plus.android.importClass("java.util.List")
plus.android.importClass("java.util.ArrayList")
plus.android.importClass("android.net.wifi.WifiManager")
plus.android.importClass("android.net.wifi.ScanResult")
plus.android.importClass("android.net.wifi.WifiConfiguration")

var PERMISSIONS = [
	'android.permission.ACCESS_FINE_LOCATION',
	'android.permission.ACCESS_COARSE_LOCATION',
	'android.permission.ACCESS_WIFI_STATE',
	'android.permission.CHANGE_WIFI_STATE'
]

var MainActivity = plus.android.runtimeMainActivity()
var Context = plus.android.importClass("android.content.Context")
var wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE)

var grant_wifi_permission = function () {
	plus.android.requestPermissions(PERMISSIONS, function(e) {
		if (e.granted.length > 0) {
			console.log("permission granted: " + e.granted.toString());
		}
	}, function(e) {
		console.log(JSON.stringify(e));
	});
}

var is_wifi_enabled = function () {
	return wifiManager.isWifiEnabled();
}

var set_wifi_enabled = function (enabled) {
	wifiManager.setWifiEnabled(enabled)
}

var scan_wifi = function () {
	wifiManager.startScan();

	var results = wifiManager.getScanResults();
	var lists = [];

	for (var count = 0; count < results.size(); count++) {
		var obj = results.get(count);

		lists.push({
			id: count,
			ssid: obj.plusGetAttribute("SSID") !== "" ? obj.plusGetAttribute("SSID") : "(empty)",
			bssid: obj.plusGetAttribute("BSSID"),
			level: obj.plusGetAttribute("level").toString(),
			capabilities: obj.plusGetAttribute("capabilities")
		});
	}

	return lists;
};

export default {
	grant_wifi_permission,
	scan_wifi,
	is_wifi_enabled,
	set_wifi_enabled
}