const fs = window.require("fs");
const path = window.require("path");

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/

async function getDesktopStream(sourceId) {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxWidth: 4000,
          maxHeight: 4000,
          minWidth: 430,
          minHeight: 320,
        },
      },
    });
  } catch (e) {
    console.error(e);
  }

  return null;
}

async function fullscreenScreenshot(
  sources,
  callback,
  imageFormat,
  userFolder
) {
  var _this = this;
  this.callback = callback;
  imageFormat = imageFormat || "image/jpeg";

  this.handleStream = (stream, sourceId) => {
    // Create hidden video tag
    var video = document.createElement("video");
    video.style.cssText = "position:absolute;top:-10000px;left:-10000px;"; // nonvisible

    // Event connected to stream
    video.onloadedmetadata = async function () {
      // Set video ORIGINAL height (screenshot)
      video.style.height = this.videoHeight + "px"; // videoHeight
      video.style.width = this.videoWidth + "px"; // videoWidth

      video.play();

      // Create canvas
      var canvas = document.createElement("canvas");
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      var ctx = canvas.getContext("2d");
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (_this.callback) {
        // Save screenshot to base64
        _this.callback(canvas.toDataURL(imageFormat));
      } else {
        const filePath = path.join(
          userFolder,
          sourceId.replace(/:/g, "_") + ".jpeg"
        );
        console.log("output:", filePath);

        const url = canvas.toDataURL(imageFormat, 0.8);
        // remove Base64 stuff from the Image
        const base64Data = url.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(filePath, base64Data, "base64", function (err) {
          if (err) console.log(err);
        });
      }

      // Remove hidden video tag
      video.remove();
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop();
      } catch (e) {}
    };

    video.srcObject = stream;
    document.body.appendChild(video);
  };

  this.handleError = function (e) {
    console.log(e);
  };

  for (const source of sources) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: source.id,
            maxWidth: 4000,
            maxHeight: 4000,
            minWidth: 430,
            minHeight: 320,
          },
        },
      });

      _this.handleStream(stream, source.id);
    } catch (e) {
      _this.handleError(e);
    }
  }
}

module.exports = {
  getDesktopStream,
  fullscreenScreenshot,
};
