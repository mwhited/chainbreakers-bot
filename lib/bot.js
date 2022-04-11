'use strict';

require('dotenv').config({silent: true});

const https = require('https');
const Records = require('./recordSheet')

class Bot {
    /**
     * Called when the bot receives a message.
     *
     * @static
     * @param {Object} message The message data incoming from GroupMe
     * @return {string}
     */
    static checkMessage(message) {
        console.log(message);
        const messageText = message.text;

        // Learn about regular expressions in JavaScript: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions
        const commandRegex = /^\//;
        const shrugRegex = /^\/shrug/;
        const beerLogBotRegex = /^\/beer/;
        const beerParseBotRegex = /^\/beer\s+(.*?)\s(.*)/;
        const linkRegex = /^\/link/;
        const tournamentLogRegex = /^\/tournament/;
        const tournamentGroupRegex = /^\/tournament\s+"(.*?)"\s(.*?)\s(.*?)\s(\d?)\s(-?[0-9]+)/;
        const eventLogRegex = /^\/cbevent/;
        const eventGroupRegex = /^\/cbevent\s+"(.*?)"\s(.*?)\s(.*?)\s(-?[0-9]+)\s(-?[0-9]+)/;
        const noteLogBotRegex = /^\/note/;
        const noteParseBotRegex = /^\/note\s+(.*)/;

        // Check if the GroupMe message has content and if the regex pattern is true
        if (messageText && shrugRegex.test(messageText) && message.name!=process.env.BOT_NAME) {
            // Check is successful, return a message!
            return '¯\\_(ツ)_/¯';
        }

        if (messageText && messageText[0]=='/' && message.name!=process.env.BOT_NAME) {
            if (linkRegex.test(messageText)) {
                //this.sendMainChannelMessage('https://docs.google.com/spreadsheets/d/1UFvamAjOMdtlukPDQDJYvJAVnou-TX8QfGOYgCK-yhQ/edit?usp=sharing');
                return 'https://docs.google.com/spreadsheets/d/1UFvamAjOMdtlukPDQDJYvJAVnou-TX8QfGOYgCK-yhQ/edit?usp=sharing';
            }
            else if (beerLogBotRegex.test(messageText)) {
                var beer = beerParseBotRegex.exec(messageText);
                console.log(beer.length);
                if (beer && beer.length >= 2) {
                    let date = Date.now().toLocaleString();
                    let image = null;
                    if(message.attachments.length>0 && message.attachments[0].type==="image"){
                        image = '=IMAGE("' + message.attachments[0].url + '")';
                    }
                    Records.updateBeerSheet(beer[0], beer[1], date, image);
                    return '' + beer[0] + ' owes ' + beer[1] + ' a beer ' + image;
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/beer ower owes <image>");
                    return null;
                }
            }
            else if (tournamentLogRegex.test(messageText)) {
                var tournament = tournamentGroupRegex.exec(messageText);
                if(tournament && tournament.length >= 5) {
                    let date = Date.now().toLocaleString();
                    Records.updateTournamentsSheet(date, tournament[0], tournament[1], tournament[2], tournament[3], tournament[4]);
                    return 'Tournament recorded for ' + tournament[0] + ' ' + tournament[1] + ' in ' + tournament[2] + ' finishing ' + tournament[3] + ' with score ' + tournament[4];
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/tournament \"tournament name\" <player> <division> <position> <score>");
                    return null;
                }
            }
            else if (eventLogRegex.test(messageText)) {
                var event = eventGroupRegex.exec(messageText);
                if(event && event.length >= 5) {
                    let date = Date.now().toLocaleString();
                    Records.updateChainbreakerEventsSheet(date, event[0], event[1], event[2], event[3], event[4]);
                    return 'Chainbreaker event recorded for ' + event[0] + ' ' + event[1] + ' finishing ' + event[2] + ' with score ' + event[3] + ' and handicap ' + event[4];
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/event \"event name\" <player> <position> <score> <handicap>");
                    return null;
                }
            }
            else if (noteLogBotRegex.test(messageText)) {
                var note = noteParseBotRegex.exec(messageText);
                if(note && note.length >= 1) {
                    let date = Date.now().toLocaleString(); 
                    let image = null;
                    if(message.attachments.length>0 && message.attachments[0].type==="image"){
                        image = '=IMAGE("' + message.attachments[0].url + '")';
                    }
                    Records.updateNotesSheet(date,message.name,note[0],image);
                    return 'Note from ' + message.name + ': ' + note[0];
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/note <noteContent> <optional-image>");
                    return null;
                }
            }
            else{
                this.sendMainChannelMessage("Available commands are: /beer /link /tournament /cbevent /note");
                return null;
            }
        }

        return null;
    };

    /**
     * Sends a message to GroupMe with a POST request.
     *
     * @static
     * @param {string} messageText A message to send to chat
     * @return {undefined}
     */
    static sendMessage(messageText) {
        // Get the GroupMe bot id saved in `.env`
        const botId = process.env.BOT_ID;

        const options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        const body = {
            bot_id: botId,
            text: messageText
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function (response) {
            if (response.statusCode !== 202) {
                console.log('Rejecting bad status code ' + response.statusCode);
            }
        });

        // On error
        botRequest.on('error', function (error) {
            console.log('Error posting message ' + JSON.stringify(error));
        });

        // On timeout
        botRequest.on('timeout', function (error) {
            console.log('Timeout posting message ' + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    };

    /**
     * Sends a message to GroupMe with a POST request.
     *
     * @static
     * @param {string} messageText A message to send to chat
     * @return {undefined}
     */
    static sendMainChannelMessage(messageText) {
        // Get the GroupMe bot id saved in `.env`
        const botId = process.env.MAIN_BOT_ID ? process.env.MAIN_BOT_ID : process.env.BOT_ID;
    

        const options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        const body = {
            bot_id: botId,
            text: messageText
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function (response) {
            if (response.statusCode !== 202) {
                console.log('Rejecting bad status code ' + response.statusCode);
            }
        });

        // On error
        botRequest.on('error', function (error) {
            console.log('Error posting message ' + JSON.stringify(error));
        });

        // On timeout
        botRequest.on('timeout', function (error) {
            console.log('Timeout posting message ' + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    };
};

module.exports = Bot;
