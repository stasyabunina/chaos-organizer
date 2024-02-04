import state from "./state";
import Message from "./Message";

const loadMessages = (messages, api, url, list) => {
  state.areAllVisible = false;
  if (messages.length !== 0) {
    if (messages.length < 10) {
      state.loadedMessagesLength = messages.length;

      for (const message of messages) {
        const newMessage = new Message(message, api, url);
        newMessage.render(list, "append");

        state.loadedMessages.push(message);

        if (state.simpleBarElement) {
          state.simpleBarElement.scrollTop = 31;
        }
      }
    } else {
      state.loadedMessagesLength = 10;

      const lastMessages = messages.slice(-state.loadedMessagesLength);

      for (const message of lastMessages) {
        const newMessage = new Message(message, api, url);
        newMessage.render(list, "append");

        state.loadedMessages.push(message);

        if (state.simpleBarElement) {
          state.simpleBarElement.scrollTop = 31;
        }
      }
    }
  } else {
    state.loadedMessagesLength = 0;
  }
}

export default loadMessages;
