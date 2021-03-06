import {
    Members
} from "./collections";
import {
    Member
} from "./class/Member";

const minute = 60000;
const hour = 3600000;

const notifyBefore = 24 * hour;

export class PushSender {
    members = [];
    showIds = [];
    shows = [];
    memberShowMap = new Map([]);

    constructor() {}

    start() {
        this.memberShowMap = new Map([]);
        this.setMembers();
        this.setShowIds();
        this.setShows();
    }


    setMembers() {
        const members = Members.find({

            $and: [{
                    shouldSendNotification: true
                },
                {
                    favorites: {
                        $exists: true,
                        $ne: []
                    }
                }
            ]
        }).map((member) => Member.fromJSON(member));
        this.members = members;
    }

    setShowIds() {
        this.showIds = [];
        this.members.forEach(member => {
            this.memberShowMap.set(member._id, member.favorites);
            this.showIds = [...this.showIds, ...member.favorites];
        });

        this.showIds = [...new Set(this.showIds)];
    }

    setShows() {
        // let today = HTTP.call('GET')
        this.shows = [];
        const promises = this.showIds.map((id) => this.getShowNextEpisode(id));

        Promise.all(promises).then((shows) => {
            shows.forEach((show) => {
                if (this.shouldSendNotificationForShow(show)) {
                    this.notifyMembersOfShow(show);
                }
            })
        }).catch((errors) => {
            console.log(errors);
        })
    }

    getShowNextEpisode(id) {
        return new Promise((resolve, reject) => {
            HTTP.get('http://api.tvmaze.com/shows/' + id + '?embed=nextepisode', {
                followRedirects: true
            }, (e, r) => {
                if (e) {
                    return reject(e);
                }

                if (r) {
                    return resolve(r.data);
                }
            });
        });
    }

    shouldSendNotificationForShow(show) {
        if (!show || !show._embedded || !show._embedded.nextepisode) {
            return false;
        }

        return this.getDifference(show) <= notifyBefore;
    }

    getDifference(show) {

        let willStartAt = new Date(show._embedded.nextepisode.airstamp);
        let now = new Date();
        return willStartAt - now;
    }

    notifyMembersOfShow(show) {
        // let member = new Member();
        const startsIn = this.getDifference(show);
        let membersToNotify = this.members.filter((member) => member.favorites.indexOf(show.id) > -1);
        membersToNotify.forEach((member) => {
            if (member.sendNotificationBefore * 60 * 60 * 1000 >= startsIn) {
                member.sendNotification(show);
            }
        });
    }
}