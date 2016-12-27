var express = require('express');
var builder = require('botbuilder');
var app = express();
var checkIn = {};



//=========================================================
// Bot Setup
//=========================================================

// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
app.post('/api/messages', connector.listen());

// Create endpoint for agent / call center
app.use('/agent', express.static('public'));


var connectorQueue = function (address) {

    checkIn[address.user.id] = address;
};

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    //welcome the user, ask the emergency
    function (session, args, next) {
        connectorQueue(session.message.address);
        for (var addy in checkIn) {
            if (addy !== session.message.address.user.id) {
                console.log(checkIn[addy]);
                next({ results: checkIn[addy]});
            }
        }


        session.replaceDialog('/');

    }, function (session, response, next) {
        console.log(response);
        if (session.message.text !== 'break') {
            bot.send(
                new builder.Message()
                    .text(session.message.text)
                    .address(response.results));
        } else {
            session.endConversation('bye');
        }

    }

]);

