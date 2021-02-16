
// var Socket = plus.android.importClass("java.net.Socket");
// var PrintWriter = plus.android.importClass("java.io.PrintWriter");
// var BufferedWriter = plus.android.importClass("java.io.BufferedWriter");
// var OutputStreamWriter = plus.android.importClass("java.io.OutputStreamWriter");
// var BufferedReader = plus.android.importClass("java.io.BufferedReader");
// var InputStreamReader = plus.android.importClass("java.io.InputStreamReader");

// var socket = new Socket("192.168.1.251", 3333);

// var outputStreamWriter = new OutputStreamWriter(socket.getOutputStream());
// var bufferWriter = new BufferedWriter(outputStreamWriter);
// var out = new PrintWriter(bufferWriter, true);
// out.println("Conneted...");

// var inputStreamReader = new InputStreamReader(socket.getInputStream());
// var br = new BufferedReader(inputStreamReader);
// console.log('br: ',br)
// console.log('br.readLine(): ', br.readLine())
// var msg = br.readLine();
// console.log('msg: ', msg)
// //while(true)
// if(msg != null)
// {
// 	console.log(msg);
// }

// #ifdef APP-PLUS
var DatagramPacket = plus.android.importClass('java.net.DatagramPacket')
var DatagramSocket = plus.android.importClass('java.net.DatagramSocket')
var InetAddress = plus.android.importClass('java.net.InetAddress')
var SocketTimeoutException = plus.android.importClass('java.net.SocketTimeoutException')
var SocketException = plus.android.importClass('java.net.SocketException')
var BufferedReader = plus.android.importClass('java.io.BufferedReader')
var InputStreamReader = plus.android.importClass('java.io.InputStreamReader')
var InputStream = plus.android.importClass('java.io.InputStream')
var JString = plus.android.importClass('java.lang.String')
var IOException = plus.android.importClass('java.io.IOException')
var Runtime = plus.android.importClass('java.lang.Runtime')
var socket;
var port = 10000;
var timeout = 6000;

const create_socket = () => {
	if (DatagramSocket == undefined) {return}
	if (socket !== undefined) {socket.close()}

	socket = new DatagramSocket();
	socket.setSoTimeout(1000);
	
	return socket
}

const ping = (ip_address) => {
	try {
		var exec = Runtime.getRuntime().exec('ping -c 1 ' + ip_address)
		var is = plus.android.invoke(exec, 'getInputStream')
		var reader = new BufferedReader(new InputStreamReader(is))
		var line

		while ((line = reader.readLine()) != null) {
			console.log(line)
		}
	} catch (IOException) {
		console.log('io exception')
	}
}

const is_reachable = (ip_address, timeout=1000) => {
	console.log(InetAddress.getLocalHost().getHostAddress())
	console.log(InetAddress.getByName(ip_address).getHostName())
	return InetAddress.getByName(ip_address).isReachable(timeout)
}

const ping_address = () => {
	create_socket()
	
	let substring = '192.168.11.'
	// let address = InetAddress.getByName('192.168.11.230')

	for(var i = 0; i < 1; i++) {
		let send_data = new Array(1024).fill(0)
		// let send_data = new Array(0).fill(0)
		let recv_data = new Array(1024).fill(0)
		// let dp = new DatagramPacket(new Array(0).fill(0), 0, 0)

		//send_data = stringToByte('hello')
		// let send_packet = new DatagramPacket(send_data, send_data.length, address, 80)
		try {
			let position = 2
			while (position < 20) {
				let dp = new DatagramPacket(new Array(0).fill(0), 0, InetAddress.getByName(substring + position), 0)
				// dp.setAddress(InetAddress.getByName(substring + position))
				position++;
			}
			socket.close();
			
			var exec = Runtime.getRuntime().exec('cmd.exe /c ipconfig /all')
			var is = plus.android.invoke(exec, 'getInputStream')
			var reader = new BufferedReader(new InputStreamReader(is))
			var line
			console.log(reader.readLine())
			while ((line = reader.readLine()) != null) {
				console.log(line)
			}
		} catch (e) {
			if (e instanceof SocketTimeoutException) {
				console.log('No reply');
			} else if (e instanceof SocketException) {
				console.log('socket exception');
			} else if (e instanceof IOException) {
				console.log('io exception')
			}
		}
	}
}

const stringToByte = (str) => {
	var bytes = new Array();
	var len, c;
	len = str.length;
	for(var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if(c >= 0x010000 && c <= 0x10FFFF) {
			bytes.push(((c >> 18) & 0x07) | 0xF0);
			bytes.push(((c >> 12) & 0x3F) | 0x80);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if(c >= 0x000800 && c <= 0x00FFFF) {
			bytes.push(((c >> 12) & 0x0F) | 0xE0);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		} else if(c >= 0x000080 && c <= 0x0007FF) {
			bytes.push(((c >> 6) & 0x1F) | 0xC0);
			bytes.push((c & 0x3F) | 0x80);
		} else {
			bytes.push(c & 0xFF);
		}
	}
	
	return bytes
}

const broadcast = () => {
	try {
		create_socket()
		var broadcast_address = InetAddress.getByName('smb://192.168.11.230')

		// 发送广播数据
		var sendData = stringToByte("广播的数据");
		var sendPacket = new DatagramPacket(sendData, sendData.length, broadcast_address, 445);
		socket.send(sendPacket);

		// 接收数据
		var isReceive = true;
		while(isReceive){
			try{
				// 设置接收缓存，需要用0填充，否则为 null 无法接收。
				var buffer = new Array(1024).fill(0);
				var packet = new DatagramPacket(buffer, buffer.length);

				socket.receive(packet);

				var data = new JString(packet.getData()).trim();
				if (data.length == 0){
					// 接收超时，结束接收
					isReceive = false;
					console.log('timeout')
				}else{
					console.log('===========收到数据============',data);
				} 
			}catch(ex){
				isReceive = false;
			}
		}
	} catch (ex) {
		console.log('===========出错了============',ex);
	} finally {
		if (socket != undefined){
			socket.close();
		}
	}

}

export default {
	ping,
	is_reachable,
	broadcast,
	ping_address
}
// #endif