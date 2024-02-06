import { setCookie, getCookie } from "./cookie";
import onCategoryClick from "./onCategoryClick";

const createVideosCategory = (videos, categories, api, url, list, element) => {
  let text;
  if (getCookie("lang") == "eng") {
    text = "videos";
  } else {
    text = "видео";
  }

  const videosLi = document.createElement("li");
  videosLi.className = "aside__item";
  const videosBtn = document.createElement("button");
  videosBtn.className = "aside__item-btn aside__videos-item-btn";
  videosBtn.type = "button";
  videosBtn.innerHTML = `
  <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="aside__item-text aside__videos-item-text">${videos.length} ${text}</span>`;

  categories.append(videosLi);
  videosLi.append(videosBtn);

  videosBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

const createLinksCategory = (links, categories, api, url, list, element) => {
  let text;
    if (getCookie("lang") == "eng") {
      text = "links";
    } else {
      text = "ссылок";
    }

    const linksLi = document.createElement("li");
    linksLi.className = "aside__item";
    const linksBtn = document.createElement("button");
    linksBtn.className = "aside__item-btn aside__links-item-btn";
    linksBtn.type = "button";
    linksBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 12C14 14.7614 11.7614 17 9 17H7C4.23858 17 2 14.7614 2 12C2 9.23858 4.23858 7 7 7H7.5M10 12C10 9.23858 12.2386 7 15 7H17C19.7614 7 22 9.23858 22 12C22 14.7614 19.7614 17 17 17H16.5" stroke="#ABABAB" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span class="aside__item-text aside__links-item-text">${links.length} ${text}</span>`;

    categories.append(linksLi);
    linksLi.append(linksBtn);

    linksBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

const createAudiosCategory = (audios, categories, api, url, list, element) => {
  let text;
    if (getCookie("lang") == "eng") {
      text = "audio";
    } else {
      text = "аудио";
    }

    const audiosLi = document.createElement("li");
    audiosLi.className = "aside__item";
    const audiosBtn = document.createElement("button");
    audiosBtn.className = "aside__item-btn aside__audios-item-btn";
    audiosBtn.type = "button";
    audiosBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="Vector" d="M19 11C19 7.13401 15.866 4 12 4C8.13401 4 5 7.13401 5 11M16 14.5V16.5C16 16.9647 16 17.197 16.0384 17.3902C16.1962 18.1836 16.8165 18.8041 17.6099 18.9619C17.8031 19.0003 18.0353 19.0003 18.5 19.0003C18.9647 19.0003 19.197 19.0003 19.3902 18.9619C20.1836 18.8041 20.8036 18.1836 20.9614 17.3902C20.9999 17.197 21 16.9647 21 16.5V14.5C21 14.0353 20.9999 13.8026 20.9614 13.6094C20.8036 12.816 20.1836 12.1962 19.3902 12.0384C19.197 12 18.9647 12 18.5 12C18.0353 12 17.8031 12 17.6099 12.0384C16.8165 12.1962 16.1962 12.816 16.0384 13.6094C16 13.8026 16 14.0353 16 14.5ZM8 14.5V16.5C8 16.9647 7.99986 17.197 7.96143 17.3902C7.80361 18.1836 7.18352 18.8041 6.39014 18.9619C6.19694 19.0003 5.96469 19.0003 5.50004 19.0003C5.03539 19.0003 4.80306 19.0003 4.60986 18.9619C3.81648 18.8041 3.19624 18.1836 3.03843 17.3902C3 17.197 3 16.9647 3 16.5V14.5C3 14.0353 3 13.8026 3.03843 13.6094C3.19624 12.816 3.81648 12.1962 4.60986 12.0384C4.80306 12 5.03539 12 5.50004 12C5.9647 12 6.19694 12 6.39014 12.0384C7.18352 12.1962 7.80361 12.816 7.96143 13.6094C7.99986 13.8026 8 14.0353 8 14.5Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__audios-item-text">${audios.length} ${text}</span>`;

    categories.append(audiosLi);
    audiosLi.append(audiosBtn);

    audiosBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

const createImagesCategory = (images, categories, api, url, list, element) => {
  let text;
  if (getCookie("lang") == "eng") {
    text = "images";
  } else {
    text = "изображений";
  }

  const imagesLi = document.createElement("li");
  imagesLi.className = "aside__item";
  const imagesBtn = document.createElement("button");
  imagesBtn.className = "aside__item-btn aside__images-item-btn";
  imagesBtn.type = "button";
  imagesBtn.innerHTML = `
  <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.2639 15.9375L12.5958 14.2834C11.7909 13.4851 11.3884 13.086 10.9266 12.9401C10.5204 12.8118 10.0838 12.8165 9.68048 12.9536C9.22188 13.1095 8.82814 13.5172 8.04068 14.3326L4.04409 18.2801M14.2639 15.9375L14.6053 15.599C15.4112 14.7998 15.8141 14.4002 16.2765 14.2543C16.6831 14.126 17.12 14.1311 17.5236 14.2687C17.9824 14.4251 18.3761 14.8339 19.1634 15.6514L20 16.4934M14.2639 15.9375L18.275 19.9565M18.275 19.9565C17.9176 20 17.4543 20 16.8 20H7.2C6.07989 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4.12796 18.7313 4.07512 18.5321 4.04409 18.2801M18.275 19.9565C18.5293 19.9256 18.7301 19.8727 18.908 19.782C19.2843 19.5903 19.5903 19.2843 19.782 18.908C20 18.4802 20 17.9201 20 16.8V16.4934M4.04409 18.2801C4 17.9221 4 17.4575 4 16.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.07989 4 7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.4934M17 8.99989C17 10.1045 16.1046 10.9999 15 10.9999C13.8954 10.9999 13 10.1045 13 8.99989C13 7.89532 13.8954 6.99989 15 6.99989C16.1046 6.99989 17 7.89532 17 8.99989Z" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="aside__item-text aside__images-item-text">${images.length} ${text}</span>`;

  categories.append(imagesLi);
  imagesLi.append(imagesBtn);

  imagesBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

const createFilesCategory = (files, categories, api, url, list, element) => {
  let text;
    if (getCookie("lang") == "eng") {
      text = "files";
    } else {
      text = "файлов";
    }

    const filesLi = document.createElement("li");
    filesLi.className = "aside__item";
    const filesBtn = document.createElement("button");
    filesBtn.className = "aside__item-btn aside__files-item-btn";
    filesBtn.type = "button";
    filesBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__files-item-text">${files.length} ${text}</span>`;

    categories.append(filesLi);
    filesLi.append(filesBtn);

    filesBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

const createTextsCategory = (texts, categories, api, url, list, element) => {
  let text;
    if (getCookie("lang") == "eng") {
      text = "text messages";
    } else {
      text = "текстовых сообщений";
    }

    const textsLi = document.createElement("li");
    textsLi.className = "aside__item";
    const textsBtn = document.createElement("button");
    textsBtn.className = "aside__item-btn aside__texts-item-btn";
    textsBtn.type = "button";
    textsBtn.innerHTML = `
    <svg class="aside__item-svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path id="Vector" d="M4 18H14M4 14H20M4 10H14M4 6H20" stroke="#ABABAB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="aside__item-text aside__texts-item-text">${texts.length} ${text}</span>`;

    categories.append(textsLi);
    textsLi.append(textsBtn);

    textsBtn.addEventListener("click", (e) => onCategoryClick(e, api, url, list, element));
}

export {createVideosCategory, createLinksCategory, createAudiosCategory, createImagesCategory, createFilesCategory, createTextsCategory};
