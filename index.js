'use strict';

class ColorGame {

    constructor(applicationId) {
        this.appId = applicationId;
        this.shouldEndSession = false;
    }

    execute(event, ctx) {
        if (event.session.application.applicationId !== this.appId) {
            throw("Invalid Application ID");
        }
        this.session = event.session;
        if (this.session.new) {
            this.onSessionStarted();
        }
        switch (event.request.type) {
            case 'LaunchRequest':
                ctx.succeed(this.onLaunch(event.request));
                break;
            case 'IntentRequest':
                ctx.succeed(this.onIntent(event.request));
                break;
            case 'SessionEndedRequest':
                this.onSessionEnded(event.request, event.session);
                ctx.succeed();
                break;
            default:
                ctx.fail('I dont know what to do!');
        }
    }

    onSessionStarted() {
        console.log('Setting up new game session', this.session);
        this.session.attributes = {};
    }

    onLaunch() {
        console.log('Welcome message!');
        return this.buildMessage('Welcome to Alexa Seed');
    }

    onIntent(request) {
        console.log('Intent Received', request.intent.name);
        console.log('Slots Received:', request.intent.slots);
        switch (request.intent.name) {
            case 'EndIntent':
                this.shouldEndSession = true;
                return this.buildMessage('');
            case 'Help':
                this.shouldEndSession = true;
                return this.buildMessage('Alexa Seed is a skill starter app, to help you start your new skill');
        }

    }

    onSessionEnded() {
        console.log('Session Ended!');
    }

    buildMessage(say, repromptText, cardTitle, cardBody) {
        let messageStruct = {
            version: '1.0',
            sessionAttributes: this.session.attributes,
            response: {
                outputSpeech: {
                    type: 'SSML',
                    ssml: '<speak>'+say+'</speak>'
                },
                shouldEndSession: (this.shouldEndSession) ? 'true' : 'false'
            }
        };
        if (typeof repromptText !== 'undefined' && repromptText.length > 0) {
            messageStruct.response.reprompt = {
                outputSpeech: {
                    type: 'PlainText',
                    text: repromptText
                }
            };
        }
        if (typeof cardTitle !== 'undefined' && cardTitle.length > 0) {
            messageStruct.response.card = {
                type: 'Simple',
                title: cardTitle,
                content: (typeof cardBody !== 'undefined' && cardBody.length > 0) ? cardBody : say
            };
        }
        return messageStruct;
    }
}

exports.handler = (event, context) => {
    let colorGame = new ColorGame('YOUR_ALEXA_APP_ID');
    colorGame.execute(event, context);
};
