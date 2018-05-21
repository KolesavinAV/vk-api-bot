const https = require('https')
const { EventEmitter } = require('events')
const util = require('util')
const process = require('process')

module.exports = (() => {
    const commandEmmiter = new EventEmitter()

    function callApi(method, token, parameters) {
        let url = `https://api.vk.com/method/${method}?access_token=${token}&v=5.74`

        if (typeof parameters !== 'function') {
            for (let param in parameters) {
                url += `&${param}=${encodeURIComponent(parameters[param])}`
            }
        }

        const callback = arguments[arguments.length - 1]

        https.get(url, res => {
            res.on('data', data => {
                if (typeof callback === 'function') {
                    callback(JSON.parse(data))
                }
            })
        })
    }

    function parseQuery(text, prefix) {
        const pattern = new RegExp(`${prefix}\\s?([А-Яа-яA-Za-z]+)(?:\\s([\\s\\S]+))?`, 'ui')
        return text.match(pattern)
    }

    /**
     * @class
     */
    class VKBot {
        constructor(token, groupId, prefix, commands) {
            if (typeof token !== 'string') {
                throw new Error('Token is not string')
            }
            if (typeof prefix !== 'string') {
                throw new Error('Prefix is not string')
            }

            this.token = token
            this.groupId = groupId
            this.prefix = prefix
            this.commands = commands
        }

        listen() {
            callApi('groups.getLongPollServer', this.token, { group_id: this.groupId }, data => {
                const { response } = data
                if (response) {
                    console.log('Start listening...')
                    let self = this
                    function callLongPoll() {
                        https.get(`${response.server}?act=a_check&key=${response.key}&ts=${response.ts}&wait=25&mode=2&version=2`, res => {
                            res.on('data', data => {
                                data = JSON.parse(data)
                                response.ts = data.ts
                                const updates = data.updates
                                if (updates) {
                                    for (let i = 0; i < updates.length; i++) {
                                        if (updates[i].type === 'message_new') {
                                            const message = updates[i].object.body
                                            const userId = updates[i].object.user_id

                                            self.emit('message', {
                                                userId: userId,
                                                message: message
                                            });

                                            if (self.commands) {
                                                let matches = parseQuery(message, self.prefix)

                                                if (matches) {
                                                    for (let commandObj of self.commands) {
                                                        if (matches[1].toLowerCase() === commandObj.command) {
                                                            commandObj.action(userId, matches[2].toLowerCase())
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                process.nextTick(callLongPoll)
                            });
                        });
                    }
                    callLongPoll()
                }
            });
        }

        response(userId, message) {
            callApi('messages.send', this.token, {
                user_id: userId,
                message: message
            });
        }
    }

    util.inherits(VKBot, EventEmitter)

    return VKBot
})()