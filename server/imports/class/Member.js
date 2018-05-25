import {
    Members
} from "../collections";
import * as jwt from 'jsonwebtoken';
import {
    Notification
} from "./Notification";

export const SECRET = 'Test';

export class Member {
    deviceId = '';
    device = '';
    registeredAt = new Date().getTime();
    favorites = [];
    favoritesDetails = [];
    notifications = []
    _id;

    constructor() {}


    save(update = false) {
        if (update) {
            // Update mongo
            Members.update(this._id, {
                $set: {
                    favorites: this.favorites,
                    favoritesDetails: this.favoritesDetails,
                    notifications: this.notifications
                }
            });
        } else {
            // Insert new one
            this._id = Members.insert(this);
        }
    }

    getJSONWebToken() {
        return jwt.sign(this._id, SECRET);
    }

    static fromJSON(json) {
        let member = new Member();

        member.device = json.device ? json.device : member.device;
        member.deviceId = json.deviceId ? json.deviceId : member.deviceId;
        member.registeredAt = json.registeredAt ? json.registeredAt : member.registeredAt;
        member.favorites = json.favorites ? json.favorites : member.favorites;
        member.favoritesDetails = json.favoritesDetails ? json.favoritesDetails : member.favoritesDetails;
        member.notifications = json.notifications ? json.notifications : member.notifications;

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
        if (this.favorites.indexOf(show.id) > -1) {} else {
            this.favorites.unshift(show.id);
            this.favoritesDetails.unshift(show);
            this.save(true);
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
        Members.update(this._id, {
            $set: {
                deviceId: this.deviceId
            }
        });
    }
}