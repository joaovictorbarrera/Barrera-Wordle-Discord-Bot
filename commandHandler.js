// Channel ID : [List of wordle game instances]
const wordleGameInstances = {}

const commands = {
    "help": (msg, args) => help(msg),
    "ping": (msg, args) => msg.reply("Pong!"),
    "wordle": (msg, args) => {
        wordleGameInstances[msg.channel.id] = startWordleGame(msg, args)
    },
    "red": (msg, args) => {
        args.shift()
        msg.channel.send("```diff\n- " + args.join(" ") + "\n```")
    }
}

function handle_commands(msg) {
    // exit if there was a wordle game happening on that channel
    if (handleWordleGameActive(msg)) return

    // no prefix or msg equals prefix (no args)
    if (msg.content.indexOf(process.env.PREFIX) !== 0) return;
    if (msg.content === process.env.PREFIX) return;

    // gets list of args
    const args = msg.content.slice(process.env.PREFIX.length).split(" ")

    // handles commands
    const command = args[0].toLowerCase()
    if(commands[command]) {
        commands[command](msg, args)
    } else {
        msg.reply("This command doesn't exist.")
    }
}

function handleWordleGameActive(msg) {
    if (wordleGameInstances.hasOwnProperty(msg.channel.id)) {
        playWordleGame(msg)
        return true
    }

    return false
}

function startWordleGame(msg, args) {
    const WordleGame = require("./wordle")
    const wordleGames = []
    const opt = getOptions(args)
    // handle quordle
    if(args.some(item => item === "quordle")) {
        for(let i = 0; i < 4; i++) {
            const quordleOpt = opt
            if(!quordleOpt.maxGuesses) quordleOpt.maxGuesses = 9
            wordleGames.push(new WordleGame(quordleOpt))
        }
    } else {
        wordleGames.push(new WordleGame(opt))
    }
    
    msg.channel.send(`Wordle Game Started! Big mode: ${wordleGames[0].big}, maxGuesses: ${wordleGames[0].maxGuesses}`)
    msg.channel.send(wordleGames[0].next())
    return wordleGames
}

function playWordleGame(msg) {

    // handle forfeit
    if(msg.content === `${process.env.PREFIX}ff`) {
        delete wordleGameInstances[msg.channel.id]
        msg.react("😢")
        msg.channel.send("Game surrended")
        return;
    }

    let failed
    const wordleGames = wordleGameInstances[msg.channel.id]
    wordleGames.forEach(game => {
        const res = game.makeGuess(msg.content)

        if (res.fail) {
            failed = res.content
            return
        }

        msg.channel.send(res.content)
        msg.channel.send(game.getKeyboard())
    })

    if(failed && failed !== "Game ended") msg.channel.send(failed)
    
    // all games finished
    if(wordleGames.every(game => game.done)) {
        // user won
        if(wordleGames.every(game => game.status === "win")) {
            msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:green_square:You Win!:green_square:")
        }
        // user lost wordle
        else if (wordleGames.length === 1) {
            msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:red_square:You Lose!:red_square:" + "\n᲼᲼᲼᲼᲼᲼᲼᲼The Word Was:\n᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼" + wordleGames[0].secret)
        } 
        // user lost quordle
        else {
            const secrets = wordleGames.map(game => game.secret)
            msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:red_square:You Lose!:red_square:" + "\n᲼᲼᲼᲼᲼᲼᲼The Words Were:\n᲼᲼᲼" + secrets)
        }
        
        delete wordleGameInstances[msg.channel.id]
        return;
    }

    // sends guess count message from a game that is not done
    msg.channel.send(wordleGames.find(game => !game.done).next())
}



function getOptions (args) {
    const options = {}
    if(args.some(item => item === "big")) options["big"] = true
    if(args.some(item => /[0-9]+/.test(item))) options["maxGuesses"] = args.find(item => /[0-9]+/.test(item))
    
    return options
}

function help (msg) {
    const helpMsg =`
WORDLE:
!!wordle -> starts simple wordle game
!!wordle <args> big -> starts wordle game in big mode
!!wordle <args> [integer] -> defines custom max guesses
!!wordle <args> quordle -> creates a quordle game (4 simultaneous games)
!!ff -> surrends a wordle game

ELSE:
!!help -> displays list of bot commands
    `;
    msg.reply(helpMsg)
}

module.exports = handle_commands
