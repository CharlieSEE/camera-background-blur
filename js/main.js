"use strict";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

document.addEventListener("DOMContentLoaded", () => {
  // Variables
  // Video
  const video = document.querySelector("video");
  const canvas = document.querySelector("canvas");
  // Control buttons
  const streamStopButton = document.getElementById("stop");
  const streamStartButton = document.getElementById("start");
  const streamBlurButton = document.getElementById("blur");
  // Options Panel
  const backgroundBlurRange = document.getElementById("backgroundBlur");
  const borderBlurRange = document.getElementById("borderBlur");
  const horizontalFlipCheckbox = document.getElementById("horizontalFlip");
  const borderBlurValueBox = document.getElementById("borderBlurValue");
  const backgroundBlurValueBox = document.getElementById("backgroundBlurValue");

  // Blur parameters
  let backgroundBlurAmount = 7;
  let edgeBlurAmount = 5;
  let flipHorizontal = true;
  // Setting html elements' values
  backgroundBlurRange.value = backgroundBlurAmount;
  backgroundBlurValueBox.innerHTML = backgroundBlurAmount;
  borderBlurRange.value = edgeBlurAmount;
  borderBlurValueBox.innerHTML = edgeBlurAmount;
  horizontalFlipCheckbox.checked = flipHorizontal;

  // Functions

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(function (stream) {
        window.stream = stream;
        video.srcObject = stream;
        video.style.display = "inline-block";
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        streamStartButton.disabled = true;
        streamStopButton.disabled = false;
        streamBlurButton.disabled = false;
      })
      .catch(function (error) {
        console.error(`Problem occured ${error}`);
      });
  };

  const stopCamera = () => {
    window.stream.getTracks().forEach(function (track) {
      track.stop();
      window.stream = null;
      video.style.display = "inline-block";
      canvas.hidden = true;
      streamStartButton.disabled = false;
      streamStopButton.disabled = true;
      streamBlurButton.disabled = true;
    });
  };

  const loadBodyPix = () => {
    bodyPix
      .load({
        multiplier: 0.75,
        stride: 32,
        quantBytes: 4,
      })
      .then((net) => perform(net))
      .catch((err) => console.log(err));
  };
  const perform = async (net) => {
    while (streamStartButton.disabled) {
      const segmentation = await net.segmentPerson(video);
      bodyPix.drawBokehEffect(
        canvas,
        video,
        segmentation,
        backgroundBlurAmount,
        edgeBlurAmount,
        flipHorizontal
      );
    }
  };

  startCamera();

  // Camera Buttons Listeners
  streamStopButton.addEventListener("click", stopCamera);
  streamStartButton.addEventListener("click", startCamera);
  streamBlurButton.addEventListener("click", () => {
    loadBodyPix();
    video.style.display = "none";
    canvas.hidden = false;
  });
  //Options Listeners
  backgroundBlurRange.addEventListener("change", () => {
    backgroundBlurAmount = backgroundBlurRange.value;
    backgroundBlurValueBox.innerHTML = backgroundBlurAmount;
  });
  borderBlurRange.addEventListener("change", () => {
    edgeBlurAmount = borderBlurRange.value;
    borderBlurValueBox.innerHTML = edgeBlurAmount;
  });
  horizontalFlipCheckbox.addEventListener("click", () => {
    flipHorizontal = horizontalFlipCheckbox.checked;
  });
});
