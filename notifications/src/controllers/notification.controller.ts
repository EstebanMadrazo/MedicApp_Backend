import Expo, { ExpoPushErrorReceipt, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
    useFcmV1: false
})

const messages: Array<ExpoPushMessage> = []

//retrieve from bd
const usersPushTokens: Array<ExpoPushMessage> = []

for (let pushToken of usersPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
    }
    messages.push({
        to: pushToken,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
    })
}

let chunks = expo.chunkPushNotifications(messages);
let tickets: Array<ExpoPushTicket> = [];
(async () => {

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);

        } catch (error) {
            console.error(error);
        }
    }
})();

let receiptIds = [];
for (let ticket of tickets) {
    if ('id' in ticket) {
        receiptIds.push(ticket.id);
    }
}


let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
    for (let chunk of receiptIdChunks) {
        try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);
            for (let receiptId in receipts) {
                if('message' in receipts[receiptId]){

                }
                let { status } = receipts[receiptId]
                if (status === 'ok') {
                    continue;
                } else if (status === 'error') {
                    let { message, details } = receipts[receiptId] as ExpoPushErrorReceipt
                    console.error(
                        `There was an error sending a notification: ${message}`
                    );
                    if (details && details.error) {
                        console.error(`The error code is ${details.error}`);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
})();