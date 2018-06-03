import {
    Members
} from "../collections";
import * as jwt from 'jsonwebtoken';
import {
    Notification
} from "./Notification";
import {
    Response
} from "./Response";

export const SECRET = 'Test';

export class Member {
    deviceId = '';
    device = '';
    registeredAt = new Date().getTime();
    favorites = [];
    favoritesDetails = [];
    notifications = [];
    shouldSendNotification = true;
    showAds = true;
    sendNotificationBefore = 10 // Hours
    _id;

    constructor() {}


    save(update = false) {
        if (update) {
            // Update mongo
            Members.update(this._id, { $set: this});
        } else {
            // Insert new one
            this._id = Members.insert(this);
        }
    }

    getSettings() {
        return {
            sendNotificationBefore: this.sendNotificationBefore,
            shouldSendNotification: this.shouldSendNotification,
            showAds: this.showAds
        }
    }

    getJSONWebToken() {
        return jwt.sign(this._id, SECRET);
    }

    static fromJSON(json) {
        let member = new Member();
        
        for (let key in json) {
            member[key] = json[key];
        }


        // member.device = json.device ? json.device : member.device;
        // member.deviceId = json.deviceId ? json.deviceId : member.deviceId;
        // member.registeredAt = json.registeredAt ? json.registeredAt : member.registeredAt;
        // member.favorites = json.favorites ? json.favorites : member.favorites;
        // member.favoritesDetails = json.favoritesDetails ? json.favoritesDetails : member.favoritesDetails;
        // member.notifications = json.notifications ? json.notifications : member.notifications;
        // member.shouldSendNotification = json.shouldSendNotification ? json.shouldSendNotification : member.shouldSendNotification;

        if (json._id) {
            member._id = json._id;
        }

        return member;
    }

    static fromJSONWebToken(jsonWebToken) {
        try {
            const _id = jwt.verify(jsonWebToken, SECRET);
            const fromDB = Members.findOne({
                _id
            });
            return Member.fromJSON(fromDB);
        } catch (e) {
            return new Member();
        }
    }

    addFavorite(show) {
        if (this.favorites.indexOf(show.id) > -1) {
            // Show already exists;

        } else {
            if (this.showAds === true || (this.showAds === false && this.favorites.length < 5)) {
                this.favorites.unshift(show.id);
                this.favoritesDetails.unshift(show);
                this.save(true);
            } else {
                console.log('User has turned off the ads. Cant add more than 5 favorites');
                return new Response(false, 400, `Can't add more than 5 favorites when ads are hidden`, {
                    favorites: this.favoritesDetails
                });
            }
        }
    }

    removeFavorite(id) {
        this.favorites = this.favorites.filter(favorite => favorite !== id);
        this.favoritesDetails = this.favoritesDetails.filter(details => details.id !== id);
        this.save(true);
    }

    sendNotification(show) {
        if (this.notifications.indexOf(show._embedded.nextepisode.id) === -1) {
            // We haven't send notification to this member lets send it
            this.notifications.unshift(show._embedded.nextepisode.id);
            new Notification(this, show).send();
            this.save(true);
        }
    }

    registerDeviceId(deviceId) {
        this.deviceId = deviceId;
        this.save(true);
    }

    setNotificationState(state) {
        this.shouldSendNotification = state;
        this.save(true);
    }

    toggleAds(show) {
        this.showAds = show;

        if (this.showAds === false) {
            if (this.favorites.length > 5) {
                this.favorites = this.favorites.splice(0, 5);
                this.favoritesDetails = this.favoritesDetails.splice(0, 5);
            }
        }
        this.save(true);
    }
}