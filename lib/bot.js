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
        const shrugRegex = /^\/shrug/i;
        const beerLogBotRegex = /^\/beer/i;
        const beerParseBotRegex = /^\/beer\s+(.*?)\s(.*)/i;
        const linkRegex = /^\/link/i;
        const tournamentLogRegex = /^\/tournament/i;
        const tournamentGroupRegex = /^\/tournament\s+"(.*?)"\s(.*?)\s(.*?)\s(\d?)\s(-?[0-9]+)/i;
        const eventLogRegex = /^\/cbevent/i;
        const eventGroupRegex = /^\/cbevent\s+"(.*?)"\s(.*?)\s(.*?)\s(-?[0-9]+)\s(-?[0-9]+)/i;
        const noteLogBotRegex = /^\/note/i;
        const noteParseBotRegex = /^\/note\s+(.*)/i;

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
                console.log(beer);
                if (beer && beer.length >= 2) {
                    let date =  new Date().toLocaleDateString();
                    console.log(date);
                    let image = null;
                    if(message.attachments.length>0 && message.attachments[0].type==="image"){
                        image = '=IMAGE("' + message.attachments[0].url + '")';
                    }
                    Records.updateBeerSheet(beer[1].toUpperCase(), beer[2].toUpperCase(), date, image);
                    return '' + beer[1] + ' owes ' + beer[2] + ' a beer ' + image;
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/beer ower owes <image>");
                    return null;
                }
            }
            else if (tournamentLogRegex.test(messageText)) {
                var tournament = tournamentGroupRegex.exec(messageText);
                if(tournament && tournament.length >= 6) {
                    let date =  new Date().toLocaleDateString();
                    Records.updateTournamentsSheet(date, tournament[1], tournament[2].toUpperCase(), tournament[3], tournament[4], tournament[5]);
                    return 'Tournament recorded for ' + tournament[1] + ' ' + tournament[2] + ' in ' + tournament[3] + ' finishing ' + tournament[4] + ' with score ' + tournament[5];
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/tournament \"tournament name\" <player> <division> <position> <score>");
                    return null;
                }
            }
            else if (eventLogRegex.test(messageText)) {
                var event = eventGroupRegex.exec(messageText);
                if(event && event.length >= 6) {
                    let date =  new Date().toLocaleDateString();
                    Records.updateChainbreakerEventsSheet(date, event[1], event[2].toUpperCase(), event[3], event[4], event[5]);
                    return 'Chainbreaker event recorded for ' + event[1] + ' ' + event[2] + ' finishing ' + event[3] + ' with score ' + event[4] + ' and handicap ' + event[5];
                }
                else {
                    this.sendMainChannelMessage("I\'m sorry, I don't understand. Please format your message:/event \"event name\" <player> <position> <score> <handicap>");
                    return null;
                }
            }
            else if (noteLogBotRegex.test(messageText)) {
                var note = noteParseBotRegex.exec(messageText);
                if(note && note.length >= 2) {
                    let date =  new Date().toLocaleDateString();
                    let image = null;
                    if(message.attachments.length>0 && message.attachments[0].type==="image"){
                        image = '=IMAGE("' + message.attachments[0].url + '")';
                    }
                    Records.updateNotesSheet(date,message.name,note[1],image);
                    return 'Note from ' + message.name + ': ' + note[1];
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
