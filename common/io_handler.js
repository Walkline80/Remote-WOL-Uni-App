/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

import settings_handler from './settings_handler.js'

// #ifdef APP-PLUS
const MainActivity = plus.android.runtimeMainActivity(),
	Intent = plus.android.importClass('android.content.Intent'),
	Uri = plus.android.importClass('android.net.Uri'),
	ByteArrayOutputStream = plus.android.importClass('java.io.ByteArrayOutputStream')

plus.android.importClass('java.io.InputStream')
plus.android.importClass('android.content.ContentResolver')

const SETTINGS_FILENAME = 'remote_wol_settings.json',
	PACKAGE_NAME = MainActivity.getPackageName()

let APP_VERSION = null

plus.runtime.getProperty(plus.runtime.appid, wgtinfo => {
	APP_VERSION = wgtinfo.version
})
// #endif

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
					settings['package_name'] = PACKAGE_NAME
					settings['app_version'] = APP_VERSION
					settings['date'] = new Date().toLocaleString()
					
					writer.write(encodeURIComponent(JSON.stringify(settings)))
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

function load_settings(uri) {
	// #ifndef APP-PLUS
	return false
	// #endif
	
	// #ifdef APP-PLUS
	choose_and_load_file(analyse_and_import_settings)
	// #endif
}

function analyse_and_import_settings(content) {
	// console.log(decodeURIComponent(content))
	try {
		const settings = JSON.parse(decodeURIComponent(content))
		console.log(settings.package_name)
	} catch (e) {
		console.error(e)
	}
}

function choose_and_load_file(callback) {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	const intent = new Intent()
		.setAction(Intent.ACTION_GET_CONTENT)
		.addCategory(Intent.CATEGORY_DEFAULT)
		.setType('application/*')

	MainActivity.startActivityForResult(Intent.createChooser(intent, 'Choose a file'), 10086)

	MainActivity.onActivityResult = (requestCode, resultCode, data) => {
		if (requestCode === 10086 && resultCode === MainActivity.RESULT_OK && data) {
			// console.log(data.toString())

			const input_stream = MainActivity.getContentResolver().openInputStream(data.getData()),
				file_reader = new ByteArrayOutputStream()
			
			let bytes = new Array(),
				temp = 0
			
			while ((temp = input_stream.read()) !== -1) {
				bytes.push(temp)
			}

			file_reader.write(bytes, 0, bytes.length)
			callback(file_reader.toString())

			input_stream.close()
			file_reader.close()
		}
	}
	// #endif
}

function share_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
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
	// #endif
}

export default {
	// choose_and_load_file,
	// analyse_and_import_settings,
	save_settings,
	load_settings,
	share_file,
}