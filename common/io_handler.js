/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

// #ifdef APP-PLUS
const MainActivity = plus.android.runtimeMainActivity(),
	Intent = plus.android.importClass('android.content.Intent'),
	Uri = plus.android.importClass('android.net.Uri'),
	File = plus.android.importClass('java.io.File'),
	FileInputStream = plus.android.importClass('java.io.FileInputStream'),
	DocumentsContract = plus.android.importClass('android.provider.DocumentsContract')
// #endif

const SETTINGS_FILENAME = 'remote_wol_settings.json'

function save_settings(settings) {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {create: true}, file_entry => {
			file_entry.remove(() => {
				console.log('delete old file success')
				
				file_entry.createWriter(writer => {
					writer.write(settings)
					console.log('write settings to file ' + file_entry.fullPath)
					
					uni.showToast({
						title: '导出成功',
						icon: 'none',
						duration: 2000
					})
				}, error => {
					console.log('createWriter failed, ' + error.message)
					uni.showToast({
						title: '导出失败',
						icon: 'none',
						duration: 2000
					})
				})
			}, error => {
				console.log('delete old file failed, ' + error.message)
				uni.showToast({
					title: '导出失败',
					icon: 'none',
					duration: 2000
				})
			})
		}, error => {
			console.log('getFile failed, ' + error.message)
			uni.showToast({
				title: '导出失败',
				icon: 'none',
				duration: 2000
			})
		})
	})
	// #endif
}

function load_settings2(file_path) {
	// #ifndef APP-PLUS
	return false
	// #endif
	
	// #ifdef APP-PLUS
	// '/external_files/加油天津日志/deviceToken.txt'
	
	
	// const file = new File('/storage/emulated/0/Android/data/io.dcloud.HBuilder/documents/remote_wol_settings.json'),
	// 	file_reader = new plus.io.FileReader()
	
	// console.log(file)
	// file_reader.readAsText(file, 'utf-8')
	// file_reader.onloaded = (event) => {
	// 	console.log(event.target)
	// 	console.log(event.target.result)
	// }
	
	plus.android.importClass(MainActivity.getContentResolver())
	const input_stream = MainActivity.getContentResolver().openInputStream(file_path.getData())
	// console.log(input_stream.available())
	let bytes = new Array()

	let temp = 0
	while (temp !== -1) {
		temp = input_stream.read()
		bytes.push(temp)
	}
	bytes.pop()

	console.log(byteToString(bytes))
	// let reader = new plus.io.FileReader()
	// console.log(reader)
	// reader.readAsText(bytes, 'utf-8')
	// console.log('hh')
	// reader.onLoad = (event) => {
	// 	console.log(event.target)
	// 	console.log(event.target.result)
	// }
	// #endif
}

function byteToString(arr) {
	if(typeof arr === 'string') {
		return arr;
	}
	var str = '',
		_arr = arr;
	for(var i = 0; i < _arr.length; i++) {
		var one = _arr[i].toString(2),
			v = one.match(/^1+?(?=0)/);
		if(v && one.length == 8) {
			var bytesLength = v[0].length;
			var store = _arr[i].toString(2).slice(7 - bytesLength);
			for(var st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2);
			}
			str += String.fromCharCode(parseInt(store, 2));
			i += bytesLength - 1;
		} else {
			str += String.fromCharCode(_arr[i]);
		}
	}
	return str;
}
function load_settings() {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {}, fileEntry => {
			fileEntry.file(file => {
				console.log(file)
				let fileReader = new plus.io.FileReader()
				// alert("getFile:" + JSON.stringify(file));
				fileReader.readAsText(file, 'utf-8')
				fileReader.onloadend = event => {
					alert("event.target" + event.target)
					alert(event.target.result)
				}
				alert(file.size + '--' + file.name)
			}, error => {
				alert(error.message)
				console.log(error.message)
				return false
			})
		}, error => {
			alert(error.message)
			console.log(error.message)
			return false
		})
	})
	// #endif
}

function choose_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	const intent = new Intent()
		.setAction(Intent.ACTION_GET_CONTENT)
		.setType('application/*')

	MainActivity.startActivityForResult(Intent.createChooser(intent, 'Choose a file'), 10086)

	MainActivity.onActivityResult = (requestCode, resultCode, data) => {
		if (requestCode === 10086 && resultCode === -1 && data) {
			console.log(data.toString()) //.getData().getPath())

			// const uri = data.getData()
			// console.log(uri.getAuthority())
			// if (DocumentsContract.isDocumentUri(MainActivity, uri)) {
			// 	//
			// }
			// // MediaStore (and general)
			// else if(uri.getScheme() === 'content') {
			// 	console.log('type: content')
			// 	getDataColumn(MainActivity, uri, null, null)
			// }
			// // File
			// else if(uri.getScheme() === 'file') {
			// 	console.log('type: file')
			// 	console.log(uri.getPath())
			// }

			load_settings2(data)
		}
	}
}

function share_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {}, file_entry => {
			const intent = new Intent()
				.setAction(Intent.ACTION_SEND)
				.setType('*/*')
				.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
				.putExtra(Intent.EXTRA_STREAM, Uri.parse(file_entry.fullPath))
				.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

			MainActivity.startActivity(Intent.createChooser(intent, 'Share a file'))
			// MainActivity.startActivity(intent)

			return true
		}, error => {
			uni.showToast({
				title: '文件不存在',
				icon: 'none',
				duration: 2000
			})
		})
	})
}

function getDataColumn(main, uri, selection, selectionArgs) {
	plus.android.importClass(main.getContentResolver())
	
	// let cursor = main.getContentResolver().openFile(uri, null, null) //.query(uri, null, null, null, null)
	const input_stream = main.getContentResolver().openInputStream(uri)

	// plus.android.importClass(cursor)
	console.log(input_stream)
	
	// if(cursor != null && cursor.moveToFirst()) {
	// 	// var column_index = cursor.getColumnIndexOrThrow('_data')
	// 	// var result = cursor.getString(column_index)
	// 	const path = cursor.getString(cursor.getColumnIndex('_data'))
	// 	console.log(path)
	// 	cursor.close()
	// 	return result
	// }
	// return null
}

export default {
	save_settings,
	load_settings,
	share_file,
	choose_file,
	load_settings2
}