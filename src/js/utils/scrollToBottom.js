const messagesContainer = document.querySelector('.main__messages-scroll-wrapper');

const scrollToBottom = (scrollDiv = messagesContainer, behavior = 'instant') => {
  scrollDiv.scrollTo({
    top: scrollDiv.scrollHeight,
    behavior: behavior
  });
};

export default scrollToBottom;
