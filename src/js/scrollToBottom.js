const scrollToBottom = (scrollDiv) => {
  if (scrollDiv) {
    setTimeout(() => {
      scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        behavior: "smooth",
      });
    }, 500);
  }
};

export default scrollToBottom;
