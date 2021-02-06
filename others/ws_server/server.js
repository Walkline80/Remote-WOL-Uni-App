const IDENTITY = "identity"
const CHECK_MQTT = "check_mqtt"
const CHECK_WIFI = "check_wifi"
const SAVE_SETTINGS = "save_settings"
const REBOOT_DEVICE = "reboot_device"

var identity_result = {
	"command": "identity_result",
	"result": "success"
}

var save_settings_result_success = {
	"command": "save_settings_result",
	"result": "success"
}

var save_settings_result_failed = {
	"command": "save_settings_result",
	"result": "failed"
}

var check_wifi_result = {
	"command": "check_wifi_result"
}

var check_internet_result_success = {
	"command": "check_internet_result",
	"result": "success"
}

var check_internet_result_failed = {
	"command": "check_internet_result",
	"result": "failed"
}

var check_mqtt_result_success = {
	"command": "check_mqtt_result",
	"result": "success"
}

var check_mqtt_result_failed = {
	"command": "check_mqtt_result",
	"result": "failed"
}

var reboot_device_result = {
	"command": "reboot_device_result",
	"result": "success"
}

const url = require('url')
const WebSocket = require('ws')
const validator = require('validator')
const valid_path = '/control'

const wss = new WebSocket.Server({
	port: 80,
	path: valid_path
})

console.log('WebSocket Server listening on port', wss.address()['port'])

wss.on('connection', function connection(ws, req) {
	const client_path = url.parse(req.url, true).path
	const client_ip = req.connection.remoteAddress
	const client_port = req.connection.remotePort

	console.log(`[client (${client_ip}:${client_port})] connected with path '${client_path}'`)

	if (client_path !== valid_path) {
		ws.send('it\'s not your device!')
		ws.close()
	}
	
	ws.on('message', function incoming(message) {
		console.log('[%s] received: %s', `client (${client_ip}:${client_port})`, message)
		
		if (validator.isJSON(message)) {
			let json_object = JSON.parse(message)
			
			switch (json_object.command) {
				case IDENTITY:
					identity_result.hardware_version = 'Version0'
					identity_result.hardware_name = 'Remote WOL v0'
					identity_result.mac_address = '246f289da321'
					identity_result.ip_address = '192.168.66.1'
					
					sleep(1000)
					ws.send(JSON.stringify(identity_result))
					break
				case CHECK_WIFI:
					check_wifi_result.result_code = 1010
					sleep(1000)
					ws.send(JSON.stringify(check_wifi_result))
					
					if (check_wifi_result.result_code === 1010) {
						sleep(1000)
						
						if (true) {
							ws.send(JSON.stringify(check_internet_result_success))
						} else {
							ws.send(JSON.stringify(check_internet_result_failed))
						}
					} 
					break
				case CHECK_MQTT:
					const error = '5'
					
					sleep(1000)
					
					if (true) {
						ws.send(JSON.stringify(check_mqtt_result_success))
					} else {
						switch (error) {
							case '5':
								check_mqtt_result_failed.error_code = '5'
								check_mqtt_result_failed.error_msg = 'Authorized failed, check Username and Password'
								break
							case '128':
								check_mqtt_result_failed.error_code = '128'
								check_mqtt_result_failed.error_msg = 'Subscribe failed, check Username and Device Name'
								break
							default:
								check_mqtt_result_failed.error_code = error
								check_mqtt_result_failed.error_msg = 'Unknown error: ' + error
								break
						}
						
						ws.send(JSON.stringify(check_mqtt_result_failed))
					}

					break
				case SAVE_SETTINGS:
					sleep(3000)
					
					if (true) {
						ws.send(JSON.stringify(save_settings_result_success))
					} else {
						ws.send(JSON.stringify(save_settings_result_failed))
					}
					break
				case REBOOT_DEVICE:
					sleep(1000)
					ws.send(JSON.stringify(reboot_device_result))
					break
				default:
					ws.send('unknown command')
					break
			}
		} else {
			ws.send('invalid message format')
		}
	})

	ws.on('close', function() {
		console.log('[%s] connection closed', `client (${client_ip}:${client_port})`)
	})

	ws.on('error', function (error) {
		console.log('[%s] connection error: %s', `client (${client_ip}:${client_port})`, error)
	})
})

function sleep(delay) {
    let start = (new Date()).getTime()
    while ((new Date()).getTime() - start < delay) {
        continue
    }
}