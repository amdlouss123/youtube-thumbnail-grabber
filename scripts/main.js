class Model {
  constructor() {
    this.data = {
      video: { link: null, id: null },
      links: { fullHD: null, medium: null, small: null },
      error: { isError: false, messages: "" },

      history: [],
    };
  }

  /* = = = HELPER METHOD START = = = */
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
  /* = = = HELPER METHOD START = = = */

  saveHistory() {
    localStorage.setItem("history", JSON.stringify(this.data.history));
  }

  updateHistory() {
    const history = JSON.parse(localStorage.getItem("history"));

    this.data.history = history !== null ? history : [];
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

    this.historySection = document.getElementById("history-section");
    this.historyWrapper = document.getElementById("history-wrap");
    this.clearHistoryBtn = document.getElementById("clear-history-btn");

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.controller.formHandler();
    });

    this.clearHistoryBtn.addEventListener("click", (e) => {
      localStorage.removeItem("history");
      this.controller.model.updateHistory();
      this.historySection.style.display = "none";
      this.historyWrapper.innerHTML = "";
    });
  }

  renderHistory(videoID) {
    const div = document.createElement("div");
    div.classList.add("col", "history-item", "rounded-3");
    div.innerHTML = `
    <button class="btn bg-body-secondary block w-100 h-100 p-0" data-video="https://youtu.be/${videoID}">
     <img src="https://img.youtube.com/vi/${videoID}/mqdefault.jpg" class="w-100 h-100 "> 
    </button>
    `;

    div.firstElementChild.addEventListener("click", (e) => {
      this.controller.fetchThumbnail(e.currentTarget.dataset.video);
      this.controller.showThumbnails();
    });

    this.historyWrapper.appendChild(div);
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
    this.model.updateHistory();
    const history = this.model.getData("history");

    if (history.length <= 0) {
      this.view.historySection.style.display = "none";
      return;
    }

    for (const item of history) {
      this.view.renderHistory(item);
    }
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

    this.view.toggleDownloadButtons(true);
    this.view.historySection.style.display = "block";
  }

  updateHistory() {
    this.model.saveHistory();
    this.model.getData("history");
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

    const isExisted = this.model.getData("history");
    const currentVideoID = this.model.getData("video").id;

    if (!isExisted.includes(currentVideoID)) {
      this.model.data.history.push(this.model.getData("video").id);
      this.updateHistory();
      this.view.renderHistory(currentVideoID);
    }

    this.showThumbnails();
  }
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);

function init() {
  view.controller = controller;

  controller.init();
}

document.addEventListener("DOMContentLoaded", init);
