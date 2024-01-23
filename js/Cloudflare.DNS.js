/*
README: https://github.com/VirgilClyne/Cloudflare
refer:https://github.com/phil-r/node-cloudflare-ddns
*/

const $ = new Env("☁ Cloudflare: 🇩 DNS v2.2.0(3)");
const DataBase = {
	"Panel": {
		"Settings":{"Switch":true,"Title":"☁ 𝙒𝘼𝙍𝙋 𝙄𝙣𝙛𝙤","Icon":"lock.icloud.fill","IconColor":"#f48220","BackgroundColor":"#f6821f","Language":"auto"},
		"Configs": {
			"Request":{"url":"https://api.cloudflareclient.com","headers":{"authorization":null,"content-Type":"application/json","user-Agent":"1.1.1.1/2109031904.1 CFNetwork/1327.0.4 Darwin/21.2.0","cf-client-version":"i-6.7-2109031904.1"}},
			"i18n":{
				"zh-Hans":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"托管中心","WARP_Level":"隐私保护","Account_Type":"账户类型","Data_Info":"流量信息","Unknown":"未知","Fail":"获取失败","WARP_Level_Off":"关闭","WARP_Level_On":"开启","WARP_Level_Plus":"增强","Account_Type_unlimited":"无限版","Account_Type_limited":"有限版","Account_Type_team":"团队版","Account_Type_plus":"WARP+","Account_Type_free":"免费版","Data_Info_Used":"已用","Data_Info_Residual":"剩余","Data_Info_Total":"总计","Data_Info_Unlimited":"无限"},
				"zh-Hant":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"託管中心","WARP_Level":"隱私保護","Account_Type":"賬戶類型","Data_Info":"流量信息","Unknown":"未知","Fail":"獲取失敗","WARP_Level_Off":"關閉","WARP_Level_On":"開啟","WARP_Level_Plus":"增強","Account_Type_unlimited":"無限版","Account_Type_limited":"有限版","Account_Type_team":"團隊版","Account_Type_plus":"WARP+","Account_Type_free":"免費版","Data_Info_Used":"已用","Data_Info_Residual":"剩餘","Data_Info_Total":"總計","Data_Info_Unlimited":"無限"},
				"en":{"IPv4":"IPv4","IPv6":"IPv6","COLO":"Colo Center","WARP_Level":"WARP Level","Account_Type":"Account Type","Data_Info":"Data","Unknown":"Unknown","Fail":"Fail to Get","WARP_Level_Off":"OFF","WARP_Level_On":"ON","WARP_Level_Plus":"PLUS","Account_Type_unlimited":"Unlimited","Account_Type_limited":"Limited","Account_Type_team":"Team","Account_Type_plus":"WARP+","Account_Type_free":"Free","Data_Info_Used":"Used","Data_Info_Residual":"Remaining","Data_Info_Total":"Earned","Data_Info_Unlimited":"Unlimited"}
			}
		}
	},
	"1dot1dot1dot1": {
		"Settings": {"Switch":true,"setupMode":"ChangeKeypair","Verify":{"RegistrationId":null,"Mode":"Token","Content":null}},
		"Configs": {"Request":{"url":"https://api.cloudflareclient.com","headers":{"authorization":null,"content-type":"application/json","user-agent":"1.1.1.1/6.22","cf-client-version":"i-6.22-2308151957.1"}}}
	},
	"VPN": {
		"Settings":{"Switch":true,"PrivateKey":"","PublicKey":""},
		"Configs":{"interface":{"addresses":{"v4":"","v6":""}},"peers":[{"public_key":"","endpoint":{"host":"","v4":"","v6":""}}]}
	},
	"DNS": {
		"Settings":{"Switch":true,"IPServer":"ipw.cn","Verify":{"Mode":"Token","Content":""},"zone":{"id":"","name":"","dns_records":[{"id":"","type":"A","name":"","content":"","ttl":1,"proxied":false}]}},
		"Configs":{"Request":{"url":"https://api.cloudflare.com/client/v4","headers":{"content-type":"application/json"}}}
	},
	"WARP": {
		"Settings":{"Switch":true,"setupMode":null,"deviceType":"iOS","Verify":{"License":null,"Mode":"Token","Content":null,"RegistrationId":null}},
		"Configs":{"Request":{"url":"https://api.cloudflareclient.com","headers":{"authorization":null,"content-type":"application/json","user-agent":"1.1.1.1/6.22","cf-client-version":"i-6.22-2308151957.1"}},"Environment":{"iOS":{"Type":"i","Version":"v0i2308151957","headers":{"user-agent":"1.1.1.1/6.22","cf-client-version":"i-6.22-2308151957.1"}},"macOS":{"Type":"m","Version":"v0i2109031904","headers":{"user-agent":"1.1.1.1/2109031904.1 CFNetwork/1327.0.4 Darwin/21.2.0","cf-client-version":"m-2021.12.1.0-0"}},"Android":{"Type":"a","Version":"v0a1922","headers":{"user-agent":"okhttp/3.12.1","cf-client-version":"a-6.3-1922"}},"Windows":{"Type":"w","Version":"","headers":{"user-agent":"","cf-client-version":""}},"Linux":{"Type":"l","Version":"","headers":{"user-agent":"","cf-client-version":""}}}}
	}
};

/***************** Processing *****************/
(async () => {
	const { Settings, Caches, Configs } = setENV("Cloudflare", "DNS", DataBase);
	// Step 1
	let status = await Verify(Configs.Request, Settings.Verify);
	//let status = true;
	if (status === true) {
		$.log("验证成功");
		// Step 2
		Settings.zone = await checkZoneInfo(Configs.Request, Settings.zone);
		// Step 3 4 5
		await Promise.allSettled(Settings.zone.dns_records.map(async dns_record => {
			$.log(`开始更新${dns_record.type}类型记录`);
			//Step 3
			let oldRecord = await checkRecordInfo(Configs.Request, Settings.zone, dns_record);
			//Step 4
			let newRecord = await checkRecordContent(dns_record, Settings.IPServer);
			//Step 5
			let Record = await setupRecord(Configs.Request, Settings.zone, oldRecord, newRecord);
			$.log(`${Record.name}上的${Record.type}记录${Record.content}更新完成`, "");
		}));
	} else throw new Error("验证失败")
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done())

/***************** Function *****************/
/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Object} { Settings, Caches, Configs }
 */
function setENV(name, platforms, database) {
	$.log(`⚠ ${$.name}, Set Environment Variables`, "");
	let { Settings, Caches, Configs } = getENV(name, platforms, database);
	/***************** Prase *****************/
	switch (Settings.Verify.Mode) {
		case "Token":
			Configs.Request.headers["authorization"] = `Bearer ${Settings.Verify.Content}`;
			break;
		case "ServiceKey":
			Configs.Request.headers["x-auth-user-service-key"] = Settings.Verify.Content;
			break;
		case "Key":
			Settings.Verify.Content = Array.from(Settings.Verify.Content.split("\n"))
			//$.log(JSON.stringify(Settings.Verify.Content))
			Configs.Request.headers["x-auth-key"] = Settings.Verify.Content[0];
			Configs.Request.headers["x-auth-email"] = Settings.Verify.Content[1];
			break;
		default:
			$.log("无可用授权方式", `Mode=${Settings.Verify.Mode}`, `Content=${Settings.Verify.Content}`);
			break;
	};
	Settings.zone.dns_records = Array.from(Settings.zone.dns_records.split("\n"))
	//$.log(JSON.stringify(Settings.zone.dns_records))
	Settings.zone.dns_records.forEach((item, i) => {
		Settings.zone.dns_records[i] = Object.fromEntries(item.split("&").map((item) => item.split("=")));
		Settings.zone.dns_records[i].proxied = JSON.parse(Settings.zone.dns_records[i].proxied);
	})
	//$.log(JSON.stringify(Settings.zone.dns_records));
	$.log(`🎉 ${$.name}, Set Environment Variables`, `Settings: ${typeof Settings}`, `Settings内容: ${JSON.stringify(Settings)}`, "");
	return { Settings, Caches, Configs }
};

//Step 1
//Verify API Token/Key
async function Verify(Request, Verify) {
	$.log("验证授权");
	let result = {};
	switch (Verify.Mode) {
		case "Token":
			result = await Cloudflare("verifyToken", Request);
			break;
		case "ServiceKey":
		case "Key":
			result = await Cloudflare("getUser", Request);
			break;
		default:
			$.log("无可用授权方式", `Mode=${Verify.Mode}`, `Content=${Verify.Content}`, "");
			break;
	}
	if (result?.status === "active") return true;
	else if (result?.suspended === false) return true;
	else return false;
};

//Step 2
async function checkZoneInfo(Request, Zone) {
	$.log("查询区域信息");
	let newZone = {};
	if (Zone?.id && Zone?.name) {
		$.log(`有区域ID${Zone.id}和区域名称${Zone.name}, 继续`);
		newZone = Zone;
	} else if (Zone?.id) {
		$.log(`有区域ID${Zone.id}, 继续`);
		newZone = await Cloudflare("getZone", Request, Zone);
	} else if (Zone?.name) {
		$.log(`有区域名称${Zone.name}, 继续`);
		newZone = await Cloudflare("listZones", Request, Zone);
	} else {
		$.logErr("未提供记录ID和名称, 终止");
		$.done();
	}
	$.log(`区域查询结果:`, `ID:${newZone.id}`, `名称:${newZone.name}`, `状态:${newZone.status}`, `仅DNS服务:${newZone.paused}`, `类型:${newZone.type}`, `开发者模式:${newZone.development_mode}`, `名称服务器:${newZone.name_servers}`, `原始名称服务器:${newZone.original_name_servers}`, "");
	const result = { ...Zone, ...newZone };
	return result;
};

//Step 3
async function checkRecordContent(Record, IPServer) {
	if (Record.type) {
		$.log(`有类型${Record.type}, 继续`);
		if (!Record.content) {
			$.log("无内容, 继续");
			switch (Record.type) {
				case "A":
					Record.content = await getExternalIP(4, IPServer);
					break;
				case "AAAA":
					Record.content = await getExternalIP(6, IPServer);
					break;
				case undefined:
					$.log("无类型, 跳过");
					break;
				default:
					$.log(`类型${Record.type}, 跳过`);
					break;
			}
		} else $.log(`有内容${Record.content}, 跳过`);
	} else {
		$.log(`无类型${Record.type}, 跳过`);
	}
	$.log(`${Record.type}类型内容: ${Record.content}`, "");
	return Record;
};

//Step 4
async function checkRecordInfo(Request, Zone, Record) {
	$.log("查询记录信息");
	let oldRecord = {};
	if (Record.id) {
		$.log(`有记录ID${Record.id}, 继续`);
		oldRecord = await Cloudflare("getDNSRecord", Request, Zone, Record);
	} else if (Record.name) {
		$.log(`有记录名称${Record.name}, 继续`);
		oldRecord = await Cloudflare("listDNSRecords", Request, Zone, Record);
	} else {
		$.log("未提供记录ID和名称, 终止");
		$.done();
	}
	$.log(`记录查询结果:`, `ID:${oldRecord.id}`, `名称:${oldRecord.name}`, `类型:${oldRecord.type}`, `内容:${oldRecord.content}`, `代理状态:${oldRecord.proxied}`, `TTL:${oldRecord.ttl}`, "");
	return oldRecord
}

//Step 5
async function setupRecord(Request, Zone, oldRecord, newRecord) {
	$.log("开始更新内容");
	let Record = {};
	if (!oldRecord.content) {
		$.log("无记录");
		Record = await Cloudflare("createDNSRecord", Request, Zone, newRecord);
	} else if (oldRecord.content !== newRecord.content) {
		$.log("有记录且IP地址不同");
		Record = await Cloudflare("updateDNSRecord", Request, Zone, { ...oldRecord, ...newRecord });
	} else if (oldRecord.content === newRecord.content) {
		$.log("有记录且IP地址相同");
		Record = oldRecord;
	}
	$.log(`记录更新结果:`, `ID:${Record.id}`, `名称:${Record.name}`, `类型:${Record.type}`, `内容:${Record.content}`, `可代理:${Record.proxiable}`, `代理状态:${Record.proxied}`, `TTL:${Record.ttl}`, `已锁定:${Record.locked}`, "");
	return Record
}

/***************** Cloudflare API v4 *****************/
async function Cloudflare(opt, Request, Zone = {}, Record = { "type": "", name: "", content: "", "ttl": 1, "priority": 10, "proxied": true }) {
	/*
	let Request = {
		// Endpoints
		// https://api.cloudflare.com/#getting-started-endpoints
		"url": "https://api.cloudflare.com/client/v4",
		"headers": {
			"Host": "api.cloudflare.com",
			"Content-Type": "application/json",
		}
	}
	*/
	let _Request = JSON.parse(JSON.stringify(Request));
	switch (opt) {
		case "trace":
			_Request.url = "https://1.1.1.1/cdn-cgi/trace"
			//_Request.url = "https://[2606:4700:4700::1111]/cdn-cgi/trace"
			return await getCloudflareJSON(_Request);
			async function getCloudflareJSON(request) {
				return await $.http.get(request).then(data => {
					let arr = data.trim().split('\n').map(e => e.split('='))
					return Object.fromEntries(arr)
				})
			};
		case "verifyToken":
			// Verify Token
			// https://api.cloudflare.com/#user-api-tokens-verify-token
			$.log("验证令牌");
			_Request.url += "/user/tokens/verify";
			return await getCFjson(_Request);
		case "getUser":
			// User Details
			// https://api.cloudflare.com/#user-user-details
			$.log("获取用户信息");
			_Request.url += "/user";
			return await getCFjson(_Request);
		case "getZone":
			// Zone Details
			// https://api.cloudflare.com/#zone-zone-details
			$.log("获取区域详情");
			_Request.url += `/zones/${Zone.id}`;
			return await getCFjson(_Request);
		case "listZones":
			// List Zones
			// https://api.cloudflare.com/#zone-list-zones
			$.log("列出区域");
			_Request.url += `/zones?name=${Zone.name}`;
			return await getCFjson(_Request);
		case "createDNSRecord":
			// Create DNS Record
			// https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
			$.log("创建新记录");
			_Request.method = "post";
			_Request.url += `/zones/${Zone.id}/dns_records`;
			_Request.body = Record;
			return await fatchCFjson(_Request);
		case "getDNSRecord":
			// DNS Record Details
			// https://api.cloudflare.com/#dns-records-for-a-zone-dns-record-details
			$.log("获取记录详情");
			_Request.url += `/zones/${Zone.id}/dns_records/${Record.id}`;
			return await getCFjson(_Request);
		case "listDNSRecords":
			// List DNS Records
			// https://api.cloudflare.com/#dns-records-for-a-zone-list-dns-records
			$.log("列出记录");
			_Request.url += `/zones/${Zone.id}/dns_records?type=${Record.type}&name=${Record.name}.${Zone.name}&order=type`;
			return await getCFjson(_Request);
		case "updateDNSRecord":
			// Update DNS Record
			// https://api.cloudflare.com/#dns-records-for-a-zone-update-dns-record
			$.log("更新记录");
			_Request.method = "put";
			_Request.url += `/zones/${Zone.id}/dns_records/${Record.id}`;
			_Request.body = Record;
			return await fatchCFjson(_Request);
		default:
			$.logErr("未设置操作类型", `opt=${opt}`, `Request=${JSON.stringify(Request)}`, "");
			return $.done();
	};
	/***************** Cloudflare API v4 *****************/
	// Function 0A
	// Get Cloudflare JSON
	function getCFjson(request) {
		return new Promise((resolve) => {
			$.get(request, (error, response, data) => {
				try {
					if (error) throw new Error(error)
					else if (data) {
						const _data = JSON.parse(data)
						if (Array.isArray(_data.messages)) _data.messages.forEach(message => {
							if (message.code !== 10000) $.msg($.name, `code: ${message.code}`, `message: ${message.message}`);
						})
						switch (_data.success) {
							case true:
								resolve(_data?.result?.[0] ?? _data?.result); // _data.result, _data.meta
								break;
							case false:
								if (Array.isArray(_data.errors)) _data.errors.forEach(error => { $.msg($.name, `code: ${error.code}`, `message: ${error.message}`); })
								break;
							case undefined:
								resolve(response);
						};
					} else throw new Error(response);
				} catch (e) {
					$.logErr(`❗️${$.name}, ${getCFjson.name}执行失败`, `request = ${JSON.stringify(request)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, "")
				} finally {
					//$.log(`🚧 ${$.name}, ${getCFjson.name}调试信息`, `request = ${JSON.stringify(request)}`, `data = ${data}`, "")
					resolve()
				}
			})
		})
	};

	// Function 0B
	// Fatch Cloudflare JSON
	function fatchCFjson(request) {
		return new Promise((resolve) => {
			$.post(request, (error, response, data) => {
				try {
					if (error) throw new Error(error)
					else if (data) {
						const _data = JSON.parse(data)
						if (Array.isArray(_data.messages)) _data.messages.forEach(message => {
							if (message.code !== 10000) $.msg($.name, `code: ${message.code}`, `message: ${message.message}`);
						})
						switch (_data.success) {
							case true:
								resolve(_data?.result?.[0] ?? _data?.result); // _data.result, _data.meta
								break;
							case false:
								if (Array.isArray(_data.errors)) _data.errors.forEach(error => { $.msg($.name, `code: ${error.code}`, `message: ${error.message}`); })
								break;
							case undefined:
								resolve(response);
						};
					} else throw new Error(response);
				} catch (e) {
					$.logErr(`❗️${$.name}, ${fatchCFjson.name}执行失败`, `request = ${JSON.stringify(request)}`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, "")
				} finally {
					//$.log(`🚧 ${$.name}, ${fatchCFjson.name}调试信息`, `request = ${JSON.stringify(request)}`, `data = ${data}`, "")
					resolve()
				}
			})
		})
	};
};

// Function 1A
// Get Public IP / External IP address
// https://www.my-ip.io/api
async function getExternalIP(type, server) {
	$.log("获取公共IP");
	const Request = {};
	switch (server) {
		case "ipw.cn":
			Request.url = `https://${type}.ipw.cn/api/ip/myip?json`;
			break;
		case "my-ip.io":
			Request.url = `https://api${type}.my-ip.io/ip.json`;
			break;
	};
	$.log(`🚧 Request=${JSON.stringify(Request)}`);
	const Data = await $.http.get(Request).then(response => JSON.parse(response.body));
	$.log(`🚧 Data=${JSON.stringify(Data)}`);
	switch (Data?.success ?? Data?.result) {
		case true:
			return Data.IP ?? Data.ip;
		case false:
			if (Array.isArray(Data.errors)) Data.errors.forEach(error => { $.msg($.name, `code: ${error.code}`, `message: ${error.message}`); })
			if (Array.isArray(Data.messages)) $.msg($.name, `code: ${Data.code}`, `message: ${Data.message}`);
			break;
		default:
			return Data?.result?.[0] ?? Data?.result;
	};
};

/***************** Env *****************/
// prettier-ignore
// https://github.com/chavyleung/scripts/blob/master/Env.min.js
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}

/**
 * Get Environment Variables
 * @link https://github.com/VirgilClyne/GetSomeFries/blob/main/function/getENV/getENV.min.js
 * @author VirgilClyne
 * @param {String} key - Persistent Store Key
 * @param {Array} names - Platform Names
 * @param {Object} database - Default Database
 * @return {Object} { Settings, Caches, Configs }
 */
function getENV(key,names,database){let BoxJs=$.getjson(key,database),Argument={};if("undefined"!=typeof $argument&&Boolean($argument)){let arg=Object.fromEntries($argument.split("&").map((item=>item.split("="))));for(let item in arg)setPath(Argument,item,arg[item])}const Store={Settings:database?.Default?.Settings||{},Configs:database?.Default?.Configs||{},Caches:{}};Array.isArray(names)||(names=[names]);for(let name of names)Store.Settings={...Store.Settings,...database?.[name]?.Settings,...Argument,...BoxJs?.[name]?.Settings},Store.Configs={...Store.Configs,...database?.[name]?.Configs},BoxJs?.[name]?.Caches&&"string"==typeof BoxJs?.[name]?.Caches&&(BoxJs[name].Caches=JSON.parse(BoxJs?.[name]?.Caches)),Store.Caches={...Store.Caches,...BoxJs?.[name]?.Caches};return function traverseObject(o,c){for(var t in o){var n=o[t];o[t]="object"==typeof n&&null!==n?traverseObject(n,c):c(t,n)}return o}(Store.Settings,((key,value)=>("true"===value||"false"===value?value=JSON.parse(value):"string"==typeof value&&(value=value.includes(",")?value.split(",").map((item=>string2number(item))):string2number(value)),value))),Store;function setPath(object,path,value){path.split(".").reduce(((o,p,i)=>o[p]=path.split(".").length===++i?value:o[p]||{}),object)}function string2number(string){return string&&!isNaN(string)&&(string=parseInt(string,10)),string}}
