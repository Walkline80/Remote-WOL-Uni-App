/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

// #ifdef APP-PLUS
const Intent = plus.android.importClass('android.content.Intent')
const Uri = plus.android.importClass('android.net.Uri')
const MainActivity = plus.android.runtimeMainActivity()
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

function choose_file() {
	// #ifndef APP-PLUS
	return false
	// #endif

	const intent = new Intent()
		.setAction(Intent.ACTION_GET_CONTENT)
		.setType('text/*')

	MainActivity.startActivityForResult(Intent.createChooser(intent, 'Choose a file'), 10086)

	MainActivity.onActivityResult = (requestCode, resultCode, data) => {
		if (requestCode === 10086 && resultCode === -1 && data) {
			console.log(data.getData().getPath())
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

export default {
	save_settings,
	load_settings,
	share_file,
	choose_file
}