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

    function matchPrefix(text, prefix) {
        const pattern = new RegExp(`^${prefix}.+`, 'gui')
        return pattern.exec(text)
    }

    /**
     * @class
     */
    class VKBot {
        constructor(token, groupId, prefix) {
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

        onCommand(command, callback) {
            commandEmmiter.on(command, callback)
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