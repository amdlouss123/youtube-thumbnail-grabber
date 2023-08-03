const fullHDImgElement = document.getElementById("fullhd-img");
const mediumImgElement = document.getElementById("medium-img");
const smallImgElement = document.getElementById("small-img");

const fullHDBtnElement = document.getElementById("fullhd-btn");
const mediumBtnElement = document.getElementById("medium-btn");
const smallBtnElement = document.getElementById("small-btn");

const thumbnailForm = document.getElementById("get-thumbnail-form");
const thumbnailFormInput = document.getElementById("get-thumbnail-form-input");

const errorMessage = document.getElementById("error");

function detectLinkType(link) {
  try {
    const url = new URL(link);
    const isFull = url.hostname.includes("youtube.com");
    const isShort = url.hostname === "youtu.be";
    const isError = !isFull && !isShort;

    if (isFull) {
      return "full";
    }

    if (isShort) {
      return "short";
    }

    if (isError) {
      return "err";
    }
  } catch (e) {
    return "err";
  }
}

function extractVideoID(link) {
  const linkType = detectLinkType(link);
  console.log(linkType);
  if (linkType === "err") return false;

  const url = new URL(link);

  if (linkType === "full") {
    return url.searchParams.get("v");
  }

  return url.pathname.substring(1);
}

function getThumbnailHandler(link) {
  const videoID = extractVideoID(link);

  if (!videoID) return "err";

  return {
    fullhd: `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`,
    medium: `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`,
    small: `https://img.youtube.com/vi/${videoID}/mqdefault.jpg`,
  };
}

function setError(bol, message) {
  if (bol) {
    errorMessage.style.display = "block";
    errorMessage.textContent = message;
    return;
  }

  errorMessage.style.display = "none";
}

thumbnailForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const link = thumbnailFormInput.value;

  if (link.length <= 0) {
    setError(true, "Input box should not be empty!");
    return;
  }

  const thumbnail = getThumbnailHandler(link);

  if (thumbnail === "err") {
    setError(true, "There is an error with the given link!");
    return;
  } else {
    setError(false);
  }

  fullHDImgElement.src = thumbnail.fullhd;

  mediumImgElement.src = thumbnail.medium;
  smallImgElement.src = thumbnail.small;

  fullHDBtnElement.href = thumbnail.fullhd;
  mediumBtnElement.href = thumbnail.medium;
  smallBtnElement.href = thumbnail.small;
});
