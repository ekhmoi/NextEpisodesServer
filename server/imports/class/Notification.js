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