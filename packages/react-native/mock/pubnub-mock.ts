import type PubNub from "pubnub";
import type {
  ListenerParameters,
  MessageAction,
  FetchMessagesResponse,
  HereNowResponse,
  PublishResponse,
  SignalResponse,
} from "pubnub";
import { rawUsers, rawMessages, workChannels } from "@pubnub/sample-data";

export function PubNubMock(): Partial<PubNub> {
  const uuid = "user_63ea15931d8541a3bd35e5b1f09087dc";
  const listeners: ListenerParameters = {};
  const actions = [];

  const addMessageAction = (obj) => {
    const action = {
      channel: obj.channel,
      data: {
        messageTimetoken: obj.messageTimetoken,
        actionTimetoken: Date.now() + "0000",
        type: obj.action.type,
        uuid,
        value: obj.action.value,
      },
      event: "added",
      publisher: uuid,
      timetoken: Date.now() + "0000",
    };
    actions.push(action);
    listeners.messageAction(action);
    return new Promise<{ data: MessageAction }>((resolve) => {
      resolve({ data: action.data });
    });
  };

  const addListener = (obj) => {
    Object.assign(listeners, obj);
  };

  const fetchMessages = async (args) => {
    let messagesCopy = [...rawMessages];
    if (args.start) {
      messagesCopy = messagesCopy.filter((m) => parseInt(m.timetoken) < parseInt(args.start));
    }
    messagesCopy = messagesCopy.slice(Math.max(messagesCopy.length - args.count, 0));

    return new Promise<FetchMessagesResponse>((resolve) => {
      resolve({
        channels: {
          [args.channels[0]]: messagesCopy,
        },
      });
    });
  };

  const getUUID = () => uuid;

  const getSubscribedChannels = () => ["space_ce466f2e445c38976168ba78e46"];

  const getSubscribedChannelGroups = () => [];

  const hereNow = (args) => {
    return new Promise<HereNowResponse>((resolve) => {
      resolve({
        totalChannels: args.channels.length,
        totalOccupancy: 5,
        channels: {
          [args.channels[0]]: {
            name: args.channels[0],
            occupancy: 5,
            occupants: [
              { uuid },
              { uuid: "user_732277cad5264ed48172c40f0f008104" },
              { uuid: "user_a673547880824a0687b3041af36a5de4" },
              { uuid: "user_2ada61d287aa42b59d620c474493474f" },
              { uuid: "user_5500315bf0a34f9b9dfa0e4fffcf49c2" },
            ],
          },
        },
      });
    });
  };

  const publish = (obj) => {
    const message = {
      channel: obj.channel,
      actualChannel: obj.channel,
      subscribedChannel: obj.channel,
      message: obj.message,
      timetoken: Date.now() + "0000",
      publisher: uuid,
      subscription: null,
      uuid,
      actions: {},
    };
    rawMessages.push(message);
    listeners.message(message);
    return new Promise<PublishResponse>((resolve) => {
      resolve({
        timetoken: parseInt(Date.now() + "0000"),
      });
    });
  };

  const removeMessageAction = (obj) => {
    const action = actions.find((a) => a.data.actionTimetoken === obj.actionTimetoken);
    const index = actions.indexOf(action);
    actions.splice(index, 1);
    action.event = "removed";
    listeners.messageAction(action);
    return new Promise<{ data: unknown }>((resolve) => {
      resolve({ data: {} });
    });
  };

  const signal = (args) => {
    listeners.signal({
      channel: args.channel,
      subscription: null,
      timetoken: Date.now() + "0000",
      message: args.message,
      publisher: uuid,
    });

    return new Promise<SignalResponse>((resolve) => {
      resolve({
        timetoken: parseInt(Date.now() + "0000"),
      });
    });
  };

  // const objects = {
  // getAllUUIDMetadata: () => ({
  //   data: rawUsers.map((u) => u.uuid),
  // }),
  // getAllChannelMetadata: () => ({
  //   data: workChannels,
  // }),
  // getChannelMembers: () => ({
  //   data: rawUsers,
  // }),
  // getMemberships: () => ({
  //   data: [
  //     { channel: { id: "space_ac4e67b98b34b44c4a39466e93e" } },
  //     { channel: { id: "space_c1ee1eda28554d0a34f9b9df5cfe" } },
  //     { channel: { id: "space_ce466f2e445c38976168ba78e46" } },
  //     { channel: { id: "space_a204f87d215a40985d35cf84bf5" } },
  //     { channel: { id: "space_149e60f311749f2a7c6515f7b34" } },
  //   ],
  // }),
  // getUUIDMetadata: (args) => ({
  //   data: rawUsers.find((u) => u.uuid.id === args.uuid).uuid,
  // }),
  // };

  return {
    addMessageAction,
    addListener,
    fetchMessages,
    getUUID,
    getSubscribedChannels,
    getSubscribedChannelGroups,
    hereNow,
    publish,
    removeMessageAction,
    signal,
    stop: () => true,
    subscribe: () => true,
    unsubscribe: () => true,
  };
}
