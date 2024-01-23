export default class WidgetAPI {
  constructor(url) {
    this.url = url;
    this.contentTypeHeader = { "Content-Type": "application/json" };
  }

  send(data) {
    return fetch(this.url + "/new-message", {
      body: JSON.stringify(data),
      method: "POST",
      headers: this.contentTypeHeader,
    });
  }

  pin(data) {
    return fetch(this.url + "/pinned", {
      body: JSON.stringify(data),
      method: "POST",
      headers: this.contentTypeHeader,
    });
  }

  favorite(data) {
    return fetch(this.url + "/favorite", {
      body: JSON.stringify(data),
      method: "POST",
      headers: this.contentTypeHeader,
    });
  }

  getMessages() {
    return fetch(this.url + "/messages", {
      method: "GET",
      headers: this.contentTypeHeader,
    });
  }

  deleteAll() {
    return fetch(this.url + "/delete-all", {
      method: "GET",
      headers: this.contentTypeHeader,
    });
  }

  search(data) {
    return fetch(this.url + "/search", {
      body: JSON.stringify(data),
      method: "POST",
      headers: this.contentTypeHeader,
    });
  }

  upload(formData) {
    return fetch(this.url + "/upload", {
      body: formData,
      method: "POST",
    });
  }
}
