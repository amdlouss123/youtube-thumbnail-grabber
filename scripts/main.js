class Model {
  constructor() {
    this.data = {
      video: { link: null, id: null },
      links: { fullHD: null, medium: null, small: null },
      error: { isError: false, messages: "" },
    };
  }

  setData(key, innerKey, value) {
    if (this.data.hasOwnProperty(key) && this.data[key].hasOwnProperty(innerKey)) {
      this.data[key][innerKey] = value;
      return 1; // Success
    }

    console.error(`Invalid parameter given! Key: ${key}, InnerKey: ${innerKey}`);
    return 0; // Failure
  }

  getData(key) {
    return this.data[key];
  }

  updateVideoID() {
    if (this.data.video.link === null) return 0; // No link provided

    try {
      const link = new URL(this.data.video.link);

      if (link.hostname === "youtu.be") {
        this.setData("video", "id", link.pathname.split("/")[1]);
        return 1; // Success
      }

      if (link.pathname.split("/")[1] === "shorts") {
        this.setData("video", "id", link.pathname.split("/")[2]);
        return 1; // Success
      }

      if (link.hostname.includes("youtube.com")) {
        this.setData("video", "id", link.searchParams.get("v"));
        return 1; // Success
      }

      return 0; // Unsupported link
    } catch (e) {
      return 0; // Error while parsing link
    }
  }

  updateThumbnailLinks() {
    if (this.data.video.id === null) return 0; // No video ID available

    this.setData("links", "fullHD", `https://img.youtube.com/vi/${this.data.video.id}/maxresdefault.jpg`);
    this.setData("links", "medium", `https://img.youtube.com/vi/${this.data.video.id}/hqdefault.jpg`);
    this.setData("links", "small", `https://img.youtube.com/vi/${this.data.video.id}/mqdefault.jpg`);
  }
}

class View {
  constructor() {
    this.controller = undefined;

    this.outputElements = [document.getElementById("fullhd-img"), document.getElementById("medium-img"), document.getElementById("small-img")];
    this.downloadButtons = [document.getElementById("fullhd-btn"), document.getElementById("medium-btn"), document.getElementById("small-btn")];

    this.form = document.getElementById("get-thumbnail-form");
    this.formInput = document.getElementById("get-thumbnail-form-input");
    this.error = document.getElementById("error");

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.controller.formHandler();
    });
  }

  displayError(isError, message) {
    if (isError) {
      this.error.style.display = "block";
      this.error.textContent = message;
    } else {
      this.error.style.display = "none";
    }
  }

  toggleDownloadButtons(isVisible) {
    for (const button of this.downloadButtons) {
      button.style.display = isVisible ? "block" : "none";
    }
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  init() {
    this.view.toggleDownloadButtons(false);
  }

  fetchThumbnail(videoLink) {
    this.model.setData("video", "link", videoLink);
    const videoID = this.model.updateVideoID();
    this.model.updateThumbnailLinks();

    return videoID;
  }

  showThumbnails() {
    const links = this.model.getData("links");

    for (let i = 0; i < this.view.outputElements.length; i++) {
      this.view.outputElements[i].src = links[Object.keys(links)[i]];
      this.view.downloadButtons[i].href = links[Object.keys(links)[i]];
    }
  }

  formHandler() {
    const inputLink = this.view.formInput.value;

    if (inputLink === "") {
      this.view.displayError(true, "Please provide a YouTube video link!");
      return;
    } else {
      this.view.displayError(false);
    }

    const isValidVideo = this.fetchThumbnail(inputLink);

    if (!isValidVideo) {
      this.view.displayError(true, "Invalid YouTube video link!");
      return;
    } else {
      this.view.displayError(false);
    }

    this.showThumbnails();
    this.view.toggleDownloadButtons(true);
  }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

view.controller = controller;
controller.init();
