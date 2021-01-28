/**
 * The MIT License (MIT)
 * Copyright © 2021 Walkline Wang (https://walkline.wang)
 * 
 * https://gitee.com/walkline/remote-wol-uni-app
 */

import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

Vue.prototype.DEV = process.env.NODE_ENV === 'development'
Vue.prototype.ANDROID = isAndroidPlatform()

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()

function isAndroidPlatform() {
	var result = false;
	
	switch (uni.getSystemInfoSync().platform) {
		case "android":
			result = true;
			break;
		default:
			break;
	}
	
	return result;
}