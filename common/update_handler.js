/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

const CHECK_UPDATE_URI = "https://walkline.wang/tools/update/api/update/v1/check_update"

/**
 * 文件大小字节数可读性转换
 * @param {integer} bytes - 文件大小字节数
 */
export function bytes_to_size(bytes) {
	if (bytes === 0) {return '0 B'}

	const k = 1024,
		sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k))

   return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

// #ifdef APP-PLUS
const MainActivity = plus.android.runtimeMainActivity(),
	package_name = MainActivity.getPackageName()
let app_version = null

plus.runtime.getProperty(plus.runtime.appid, wgtinfo => {
	app_version = wgtinfo.version
})

/**
 * 检查、下载、安装更新文件
 */
function check_update() {
	console.log('checking update, current version: ' + app_version)

	uni.request({
		url: CHECK_UPDATE_URI,
		data: {
			package_name: package_name, // plus.runtime.appid,
			app_version: app_version // plus.runtime.version
		},
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		method: 'POST',
		success: (result) => {
			if (result.statusCode == 200 && !result.data.error_code) {
				const status = result.data.status, // 0: 无更新, 1: apk 更新, 2: wgt 更新
					version = result.data.version,
					note = result.data.note,
					size = result.data.size,
					url = result.data.url,
					force_update = result.data.force_update,
					date = result.data.date

				if (status === 1) {
					if (force_update) {
						uni.showToast({
							title: `发现新版本 (${version})，正在下载安装新版本...`,
							duration: 5000,
							position: 'center',
							icon: 'none'
						})
						
						download_and_install_update(url)
					} else {
						uni.showModal({
							title: `发现新版本 (${version})`,
							content: `更新内容：\n\n${note}\n\n文件大小：${bytes_to_size(size)}\n更新日期：${date}`,
							confirmText: '立即下载',
							success: (result) => {
								if (result.confirm) {
									uni.showToast({
										title: `正在下载安装新版本 (${version})...`,
										duration: 5000,
										position: 'center',
										icon: 'none'
									})
									
									download_and_install_update(url)
								}
							}
						})
					}
				} else if (status === 2) {
					console.log('found wgt file with version:' + version)
					download_and_install_update(url, 2)
				} else {
					console.log('no update founded')
				}
			}
		},
		fail: (result) => {
			console.log('request failed: ', result)
		}
	})
}

/**
 * 下载并安装更新文件
 * 
 * @param {string} url - 更新文件下载地址
 * @param {integer} method - 安装完成后的处理方式，1：退出程序，2：重启程序
 */
function download_and_install_update(url, method=1) {
	console.log('start downloading update file')
	
	uni.downloadFile({
		url: url,
		success: (result) => {
			console.log('update file downloaded')
			
			if (result.statusCode === 200) {
				console.log('start installing update file')
				
				plus.runtime.install(result.tempFilePath, {
					force: false
				}, () => {
					console.log('install success with method ' + method)
					method === 1 ? plus.runtime.quit() : plus.runtime.restart()
				}, (error) => {
					console.error('install failed: ', error)
					uni.showToast({
						title: '更新文件安装失败，请稍后重试',
						duration: 5000,
						position: 'center',
						icon: 'none'
					})
				})
			}
		}, fail: () => {
			console.log('download update file failed')
			uni.showToast({
				title: '更新文件下载失败',
				duration: 5000,
				position: 'center',
				icon: 'none'
			})
		}
	})
}

export default {
	// CHECK_UPDATE_URI,
	// bytes_to_size,
	// download_and_install_update,
	check_update
}
// #endif
