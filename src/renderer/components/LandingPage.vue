<template>
    <div id="wrapper">
        <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
        <main>
            <div class="doc">
                <h3 class="title">App Logs</h3>
                <pre>
                    <code>
{{ process_data }}
                    </code>
                </pre>
                <button @click="saveTracks()">Save Data Manually</button>
                <hr />
                <ul>
                    <li v-for="(log, app_name) in logs">
                        {{ app_name }}
                        <ol v-for="activity in log">=> {{ activity.details.title }} - ( {{ activity.timer
                            }} seconds )
                        </ol>
                    </li>
                </ul>
            </div>
        </main>
        <hr/>
        <system-information></system-information>
    </div>
</template>

<script>
	import SystemInformation from './LandingPage/SystemInformation'
	import forEach from 'lodash/forEach';
	import {getApiUrl} from '../api'

	const osascript = require('node-osascript');
	const activeWin = require('active-win');
	const url = require('url');

	export default {
		name: 'landing-page',
		components: {SystemInformation},
		data() {
			return {
				logs: {},
				active_app: null,
				interval: 5,
				process_data: []
			}
		},
		methods: {
			open(link) {
				this.$electron.shell.openExternal(link)
			},
			getWindows() {
				this.getActiveWindow((res) => {
					res.time = this.getFormattedDate();

					this.active_app = res.app;

					if (res.app in this.logs) {
						if (res.domain in this.logs[res.app]) {
							let domainTimer = this.logs[res.app][res.domain].timer;
							this.logs[res.app][res.domain].timer += this.interval;
						} else {
							this.$set(this.logs[res.app], res.domain, {
								details: res,
								timer: 0
							});
						}
					} else {
						this.$set(this.logs, res.app, {
							[res.domain]: {
								details: res,
								timer: 0
							}
						});
					}
					this.showProcessData();
				});
			},
			getActiveWindow(callback) {
				activeWin().then(response => {

					if (!response.title) {
						response.title = response.app;
					}

					if (this.isBrowser(response.app)) {
						osascript.execute('tell application "Google Chrome"\nget URL of active tab of first window\nend tell', (err, result, raw) => {
							if (!err) {
								response.domain = url.parse(result).hostname;
								response.active_url = result;
								callback(response);
								return;
							} else {
								console.log(err);
							}
						});
					} else {
						response.domain = response.title;
						callback(response);
					}
				});
			},
			getFormattedDate() {
				return Math.floor(Date.now() / 1000);
			},
			isBrowser(app_string) {
				if (app_string === 'Google Chrome') {
					return true;
				} else if (app_string === 'FireFox') {
					return true;
				}
				return false;
			},
			getProcessedData() {
				let logs = this.logs;
				let formattedData = [];
				forEach(logs, (activities, app_name) => {
					forEach(activities, (item, title) => {
						if (item.timer) {
							formattedData.push({
								app_name: app_name,
								category: '',
								domain: item.details.domain,
								timestamp: item.details.time,
								title: item.details.title,
								time_spent: item.timer,
								device_id: 'jewel'
							});
						}
					});
				});
				return formattedData;
			},
			showProcessData() {
				this.process_data = this.getProcessedData();
			},
			saveTracks() {
				let data = {tracks: this.getProcessedData()};
				this.$http.post(getApiUrl('trackings'), data)
					.then((response) => {
						this.resetCount();
						console.log('recorded');
					})
					.catch((error) => {
						console.log(error);
					});
			},
			resetCount() {
		        this.logs = {};
			    this.process_data = [];
			}
		},
		mounted() {
			setInterval(() => {
				this.getWindows();
			}, this.interval * 1000);

		setInterval(() => {
			this.saveTracks();
		}, 61000 );
		}
	}
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Source Sans Pro', sans-serif;
    }

    #wrapper {
        background: radial-gradient(
                ellipse at top left,
                rgba(255, 255, 255, 1) 40%,
                rgba(229, 229, 229, .9) 100%
        );
        height: 100vh;
        padding: 60px 80px;
        width: 100vw;
    }

    #logo {
        height: auto;
        margin-bottom: 20px;
        width: 420px;
    }

    main {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
    }

    main > div {
        flex-basis: 100%;
    }
</style>
