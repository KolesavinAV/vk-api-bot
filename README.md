# NodeJS message bot for vk.com public group

## Installation:  
You can easily install this nodejs module with `npm`
```
npm install vk-api-bot
```
---
## Usage:  
After installation you should require module and create bot object:  
   
```javascript
const VKBot = require('vk-api-bot')

const bot = new VKBot(token, group_id, prefix, commands)

bot.listen()
```
`Token` is string which you can recieve following this [instruction](https://vk.com/dev/access_token).  
`Group_id` is your group identifier.  
`Prefix` is sybmol, that you'll write before bot's commands.   
`Commands` is array, that contains list of commands, with which bot will interact.  

`Listen` function is necessary to bot start read incomming messages.

### Commands array example:
```javascript
const commands = [
    {
        command: 'commandName',
        desc: 'Command description',
        action: function (userId, value) {
            console.log(`Message from user ${userId}`)
        }
    },
    ...another commands
]
```

When the bot recieved a message - he parsing it and if the first word equals one of defined commands he execute the corresponding function, which contains two parameters: `userId` - identifier of user who sended a message and `value` - some value, has been written after command in a message. If you don't wrote some addition values to command, parameter `value` will be equal `undefined`.

`Desc` parameter is description of command. It's doesn't using now, but it will be implemented in closest patch.

---
### Also
Bot can respond to all messages. It can be used by hanle `message` event.  
```javascript
const VKBot = require('vk-api-bot')

const bot = new VKBot(token, group_id, prefix, commands)

bot.on('message', response => {
    console.log(`Message ${response.message} was recieved from user with id ${response.userId}`)
})

bot.listen()
```  
In additoin bot have this list of methods:  
* *response(userId, message)* - send a message to user. Require two parameters: `userId` and `message`.
* *callApi(method, token, [parameters, [callback]])* - call some api method. Require two necessary parameters: `method`, the list of which is [here](https://vk.com/dev/methods) and your group token, which contains in `bot.token` parameter. And this function contains two unnecassary parameters: `parameters` is object of transmitted parameters to the api method (the names of object parameters must be the same as transmitted parameters names), `callback` is callback function like `function(data){}`.
  * *data* - parameter of callback function, represents answer from vk.com api server.