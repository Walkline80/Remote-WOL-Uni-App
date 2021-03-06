/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

import settings_handler from './settings_handler.js'
import {bytes_to_size} from './update_handler.js'

// #ifdef APP-PLUS
plus.android.importClass('android.content.ContentResolver')

const MainActivity = plus.android.runtimeMainActivity(),
	Intent = plus.android.importClass('android.content.Intent'),
	Uri = plus.android.importClass('android.net.Uri'),
	InputStreamReader = plus.android.importClass('java.io.InputStreamReader'),
	OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter'),
	BufferedReader = plus.android.importClass('java.io.BufferedReader'),
	BufferedWriter = plus.android.importClass('java.io.BufferedWriter'),
	File = plus.android.importClass('java.io.File'),
	FileInputStream = plus.android.importClass('java.io.FileInputStream'),
	FileOutputStream = plus.android.importClass('java.io.FileOutputStream'),
	MediaScannerConnection = plus.android.importClass('android.media.MediaScannerConnection'),
	Environment = plus.android.importClass('android.os.Environment'),

	SETTINGS_FILENAME = 'remote_wol_settings.json',
	PACKAGE_NAME = MainActivity.getPackageName()

let APP_VERSION = null,
	load_settings_callback = null

plus.runtime.getProperty(plus.runtime.appid, wgtinfo => {
	APP_VERSION = wgtinfo.version
})
// #endif

/**
 * 保存设置内容到文件
 * 
 * @param {object} settings - 要保存的设置内容对象
 */
function save_settings() {
	// #ifndef APP-PLUS
	return false
	// #endif

	const settings = settings_handler.export_settings()

	// #ifdef APP-PLUS
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {create: true}, file_entry => {
			file_entry.remove(() => {
				console.log('delete old file success')

				file_entry.createWriter(writer => {
					settings['settings_information'] = {
						'package_name': PACKAGE_NAME,
						'app_version': APP_VERSION,
						'date': new Date().toLocaleString()
					}
					
					writer.write(JSON.stringify(settings))
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

/**
 * 从文件读取并恢复设置
 */
function load_settings(callback) {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	load_settings_callback = callback
	choose_and_load_file(analyse_and_import_settings)
	// #endif
}

function analyse_and_import_settings(content) {
	try {
		const settings = JSON.parse(content),
			information = settings.settings_information,
			app_items = settings.app_items,
			device_items = settings.device_items,
			pc_items = settings.pc_items

		if (information.package_name === PACKAGE_NAME) {
			uni.showModal({
				title: '文件信息',
				content: `版本：${information.app_version}\n大小：${bytes_to_size(content.length)}\n日期：${information.date}\n\nPC 数量：${device_items.length}\n硬件数量：${pc_items.length}`,
				confirmText: '导入文件',
				success: result => {
					let success = false
					
					if (result.confirm) {
						try {
							uni.clearStorageSync()
						} catch (error) {
							console.log('clearStorageSync error: ' + error)
						}
						
						app_items.forEach(app => {
							settings_handler.save_app_settings(app)
						})
						
						device_items.forEach(device => {
							settings_handler.save_device_item(device)
						})
						
						pc_items.forEach(pc => {
							settings_handler.save_pc_item(pc)
						})

						load_settings_callback()
						success = true
					}

					uni.showToast({
						title: `设置导入${success ? '成功' : '失败'}`,
						icon: 'none',
						duration: 2000
					})
				}
			})
		} else {
			uni.showToast({
				title: '包名不符无法导入',
				icon: 'none',
				duration: 2000
			})
		}
	} catch (error) {
		console.error(error)
		uni.showToast({
			title: '文件格式错误',
			icon: 'none',
			duration: 2000
		})
	}
}

/**
 * 获取选中文件的内容
 * 
 * @param {function} callback - 处理获取文件内容回调函数
 */
function choose_and_load_file(callback) {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	const intent = new Intent()
		.setAction(Intent.ACTION_GET_CONTENT)
		.addCategory(Intent.CATEGORY_DEFAULT)
		.setType('text/*')

	MainActivity.startActivityForResult(Intent.createChooser(intent, 'Choose a file'), 10086)

	MainActivity.onActivityResult = (requestCode, resultCode, data) => {
		if (requestCode === 10086 && resultCode === MainActivity.RESULT_OK && data) {
			// console.log(data.toString())
			const input_stream = MainActivity.getContentResolver().openInputStream(data.getData()),
				file_reader = new BufferedReader(new InputStreamReader(input_stream))

			callback(file_reader.readLine())

			input_stream.close()
			file_reader.close()
		}
	}
	// #endif
}

/**
 * 分享设置文件
 */
function share_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	// #ifdef APP-PLUS
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, fs => {
		fs.root.getFile(SETTINGS_FILENAME, {}, file_entry => {
			const listener = new plus.android.implements('android.media.MediaScannerConnection$OnScanCompletedListener', {
				'onScanCompleted': (path, uri) => {
					console.log('uri: ' + uri.toString())

					const intent = new Intent()
						.setAction(Intent.ACTION_SEND)
						.setType('text/*')
						.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
						.putExtra(Intent.EXTRA_TEXT, 'Share a file')
						.putExtra(Intent.EXTRA_STREAM, uri) // Uri.parse(file_entry.fullPath))
						.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION)

					MainActivity.startActivity(Intent.createChooser(intent, 'Share a file'))
					// MainActivity.startActivity(intent)
					new File(path).deleteOnExit()
				}
			})

			if (copy_file_to_public_directory(file_entry.fullPath)) {
				MediaScannerConnection.scanFile(MainActivity, [get_public_directory() + '/' + SETTINGS_FILENAME], null, listener)
			} else {
				uni.showToast({
					title: '复制文件出错',
					icon: 'none',
					duration: 2000
				})
			}

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

function copy_file_to_public_directory(file_path) {
	// #ifndef APP-PLUS
	return false
	// #endif
	
	// #ifdef APP-PLUS
	const input_stream = new FileInputStream(file_path),
		output_Stream = new FileOutputStream(get_public_directory() + '/' + SETTINGS_FILENAME),
		file_reader = new BufferedReader(new InputStreamReader(input_stream)),
		file_writer = new BufferedWriter(new OutputStreamWriter(output_Stream)),
		content = file_reader.readLine()

	file_writer.write(content, 0, content.length)
	file_writer.flush()

	file_writer.close()
	file_reader.close()
	output_Stream.close()
	input_stream.close()
	console.log('copy file success')

	return true
	// #endif
}

function get_public_directory() {
	// '/storage/emulated/0/Download/temp'
	// #ifndef APP-PLUS
	return false
	// #endif
	
	// #ifdef APP-PLUS
	return new File(Environment.getExternalStorageDirectory(), 'Download/temp').getAbsolutePath()
	// #endif
}

export default {
	// choose_and_load_file,
	// analyse_and_import_settings,
	// copy_file_to_public_directory,
	// get_public_directory,
	save_settings,
	load_settings,
	share_file,
}