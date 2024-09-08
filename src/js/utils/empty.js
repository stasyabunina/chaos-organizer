const messagesWrapper = document.querySelector('.main__messages-wrapper');

function emptyRender() {
    messagesWrapper.insertAdjacentHTML('beforeend', `<div class="empty-wrapper absolute flex justify-center items-center w-full h-full text-[#7d7f82]">Пусто.</div>`);
}

function emptyRemove() {
    const empty = messagesWrapper.querySelector('.empty-wrapper');
    if (empty) {
        empty.remove();
    }
}

export { emptyRender, emptyRemove }