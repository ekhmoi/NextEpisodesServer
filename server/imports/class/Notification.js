import Expo from 'expo-server-sdk';
let expo = new Expo();

export class Notification {
    constructor(member, show) {
        this.member = member;
        this.show = show;
    }

    sendToApple() {
        // Need to send apple
    }

    sendToGoogle() {

    }

    send() {
        let title = this.getNotificationTitle();
        let message = this.getNotificationMessage();

        console.log(`
### 
--------------------------
Start Sending Notification
--------------------------
Show: ${this.show.name}
Episode: ${this.show._embedded.nextepisode.name}
EpisodeID: ${this.show._embedded.nextepisode.id}
UserID: ${this.member._id}
DeviceID: ${this.member.deviceId}
Device: ${this.member.device}
CountDown: ${this.getCountdown()}
NotificationTitle: ${title}
NotificationMessage: ${message}
--------------------------
End Sending Notification
--------------------------
###
        `);

        if (!Expo.isExpoPushToken(this.member.deviceId)) {
            console.log(`Push token ${this.member.deviceId} is not a valid Expo push token`);
            return;
        }

        const messages = [{
            to: this.member.deviceId,
            sound: 'default',
            title: title,
            body: message,
            data: { title, message }
        }];
        let chunks = expo.chunkPushNotifications(messages);

        (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
            let receipts = await expo.sendPushNotificationsAsync(chunk);
            console.log(receipts);
            } catch (error) {
            console.error(error);
            }
        }
        })();
    }

    getCountdown() {
        const willStartAt = new Date(this.show._embedded.nextepisode.airstamp);
        const now = new Date();

        let difference = willStartAt - now;
        return difference;
    }

    getNotificationMessage() {
        return `Next episode starts in ${this.getCountDownMessage()}. Don't miss it!`
    }

    getNotificationTitle() {
        return `${this.show.name} - ${this.show._embedded.nextepisode.name}`;
    }

    getCountDownMessage() {
        let countdown = this.getCountdown();
        let hours = parseInt(countdown / 60 / 60 / 1000);
		let minutes;

		if (hours > 0) {
        	minutes = parseInt(countdown % (hours * 60 * 60 * 1000) / 60 / 1000);
        } else {
			minutes = parseInt(countdown / 60 / 1000);
        }

        let hourMessage = `${hours === 0 ? '' : hours === 1 ? (hours + ' hour') : (hours + ' hours')}`;
        let minuteMessage = `${minutes === 0 ? '' : minutes === 1 ? (minutes + ' minute') : (minutes + ' minutes')}`;

        return `${hourMessage}${minuteMessage !== '' && hourMessage !== '' ? ' and ' : ''}${minuteMessage}`;
    }
}