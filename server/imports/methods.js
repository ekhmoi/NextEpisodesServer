import {
    URLS
} from "../../constants";
import {
    Member
} from "./class/Member";
import {
    Response
} from "./class/Response";

Meteor.methods({
    init(device) {
        console.log('recieved request', device)
        if (!device) {
            return new Response(false, 400, 'Bad request', {});
        }
        const member = Member.fromJSON({
            device
        });
        member.save();
        const token = member.getJSONWebToken();
        return new Response(true, 200, 'success', {
            token
        })
    },
    'register-device' ({
        deviceId,
        token
    }) {
        if (!deviceId || !token) {
            return new Response(false, 400, 'Bad request', {});
        }


        const member = Member.fromJSONWebToken(token);
        member.registerDeviceId(deviceId);
        return new Response(true, 200, 'success', {})
    },
    'add-favorite': ({
        token,
        showId
    }) => {
        // console.log(token, showId);
        if (!token || !showId) {
            return new Response(false, 400, 'Bad request', {});
        }

        const member = Member.fromJSONWebToken(token);

        if (!member || !member._id) {
            return new Response(false, 404, 'User not found', {});
        }

        try {
            const show = HTTP.get('http://api.tvmaze.com/shows/' + showId, {
                followRedirects: true
            }).data;
            member.addFavorite(show);

            return new Response(true, 200, 'Succcess', {
                favorites: member.favoritesDetails
            })
        } catch (err) {
            console.log(err);
            return new Response(false, 500, 'Internal Error', {});
        }
    },
    'remove-favorite': ({
        token,
        showId
    }) => {
        if (!token || !showId) {
            return new Response(false, 400, 'Bad request', {});
        }

        const member = Member.fromJSONWebToken(token);

        if (!member || !member._id) {
            return new Response(false, 404, 'User not found', {});
        }

        try {
            member.removeFavorite(showId);

            return new Response(true, 200, 'Succcess', {
                favorites: member.favoritesDetails
            })
        } catch (err) {
            // console.log(err);
            return new Response(false, 500, 'Internal Error', {});
        }
    },
    'get-favorites': ({
        token
    }) => {
        if (!token) {
            return new Response(false, 400, 'Bad Request', {});
        }

        const member = Member.fromJSONWebToken(token);

        if (!member || !member._id) {
            return new Response(false, 404, 'User not found', {});
        }

        try {
            return new Response(true, 200, 'Succcess', {
                favorites: member.favoritesDetails
            })
        } catch (err) {
            return new Response(false, 500, 'Internal Error', {});
        }
    },
    'toggle-notification': ({
        token,
        state
    }) => {
        if (!token || !state) {
            return new Response(false, 400, 'Bad request', {});
        }

        const member = Member.fromJSONWebToken(token);

        if (!member || !member._id) {
            return new Response(false, 404, 'User not found', {});
        }

        try {
            member.setNotificationState(state);
            return new Response(true, 200, 'Succcess', {});

        } catch (err) {
            return new Response(false, 500, 'Internal Error', {});
        }
    }
});