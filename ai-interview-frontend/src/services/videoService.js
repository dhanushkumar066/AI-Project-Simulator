// Video capture and analysis service
class VideoService {
  constructor() {
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.isRecording = false;
  }

  // Initialize webcam
  async initializeWebcam(videoElement) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      videoElement.srcObject = this.stream;
      return { success: true };
    } catch (error) {
      console.error("Webcam access error:", error);
      return {
        success: false,
        message: "Webcam access denied. Please enable camera permissions.",
      };
    }
  }

  // Start recording video and audio
  startRecording(videoElement) {
    const canvas = videoElement.canvas || null;
    const stream = canvas
      ? canvas.captureStream(30)
      : this.mergeAudioVideo(videoElement);

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9,opus",
    });
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.start();
    this.isRecording = true;
  }

  // Merge audio from system and video stream
  mergeAudioVideo(videoElement) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const video = videoElement;

    // Draw video to canvas for recording
    const drawFrame = () => {
      if (this.isRecording) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      }
    };
    drawFrame();

    return canvas.captureStream(30);
  }

  // Stop recording and get blob
  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "video/webm" });
        this.isRecording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  // Upload video for analysis
  async uploadVideoForAnalysis(videoBlob, interviewId, questionNumber) {
    try {
      const formData = new FormData();
      formData.append("video", videoBlob, `answer_${questionNumber}.webm`);
      formData.append("interviewId", interviewId);
      formData.append("questionNumber", questionNumber);

      const response = await fetch("/interviews/analyze-video", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Video upload error:", error);
      return { success: false, message: error.message };
    }
  }

  // Stop webcam stream
  stopWebcam() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

export default new VideoService();
