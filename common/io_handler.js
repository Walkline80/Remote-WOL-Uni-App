/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

// #ifdef APP-PLUS
var MainActivity = plus.android.runtimeMainActivity()
var Intent = plus.android.importClass('android.content.Intent')
var Uri = plus.android.importClass('android.net.Uri')
// #endif

const SETTINGS_FILENAME = 'remote_wol_settings.json'
const TEMP_FILE = 'temp_file'

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

function load_settings() {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {}, fileEntry => {
			fileEntry.file(file => {
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

function share_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	let file_path = null
	
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {}, file_entry => {
			file_path = file_entry.fullPath
			
			const intent = new Intent(Intent.ACTION_SEND),
				file_uri = Uri.parse(file_path),
				context = MainActivity.getApplicationContext()
			
			intent.setType("*/*")
			intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
			intent.putExtra(Intent.EXTRA_STREAM, file_uri)
			intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
			
			context.startActivity(Intent.createChooser(intent, "分享文件"))
			// context.startActivity(intent)
			
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

export default {
	save_settings,
	load_settings,
	share_file
}