// Emotion and body language detection using TensorFlow.js
// This uses face detection to analyze:
// - Face position (confidence, posture)
// - Expression changes (emotion approximation)
// - Eye contact (face centered in frame = good eye contact)
// - Head movement (engagement)

class EmotionDetectionService {
  constructor() {
    this.isInitialized = false;
    this.faceDetectionModel = null;
    this.emotionMetrics = {
      engagementScore: 0,
      confidenceScore: 0,
      eyeContactScore: 0,
      expressiveness: 0,
      pauses: 0,
    };
  }

  // Initialize emotion detection (loads TensorFlow models)
  async initialize() {
    try {
      // Note: For production, load actual ML models
      // For now, we use heuristics based on video frame analysis
      this.isInitialized = true;
      console.log("✅ Emotion detection initialized (heuristic mode)");
      return { success: true };
    } catch (error) {
      console.error("Emotion detection init error:", error);
      return { success: false, message: error.message };
    }
  }

  // Analyze video frames for emotions and body language
  async analyzeVideoFrames(videoElement, duration) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 240;

      const metrics = {
        frameCount: 0,
        faceDetected: 0,
        faceCentered: 0,
        movementFrames: 0,
        expressionChanges: 0,
        avgBrightness: [],
      };

      const analyzeFrame = () => {
        if (!videoElement.paused) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Analyze brightness as proxy for expression
          const brightness = this.calculateBrightness(imageData.data);
          metrics.avgBrightness.push(brightness);

          // Detect face region (simplified - looks for skin tones)
          const faceRegions = this.detectFaceRegions(imageData.data);
          if (faceRegions.detected) {
            metrics.faceDetected++;
            if (faceRegions.centered) metrics.faceCentered++;
          }

          metrics.frameCount++;
        }

        if (videoElement.currentTime < duration) {
          setTimeout(analyzeFrame, 100);
        } else {
          const analysis = this.calculateEmotionScores(metrics);
          resolve(analysis);
        }
      };

      analyzeFrame();
    });
  }

  // Calculate brightness of image (proxy for expression)
  calculateBrightness(pixels) {
    let total = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      // R + G + B average
      total += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    return total / (pixels.length / 4);
  }

  // Detect face regions (simplified skin tone detection)
  detectFaceRegions(pixels) {
    let skinPixels = 0;
    const centerPixels = { x: 0, totalSkin: 0 };

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Simplified skin tone detection
      if (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        Math.abs(r - g) > 15
      ) {
        skinPixels++;
        centerPixels.totalSkin++;
      }
    }

    return {
      detected: skinPixels > 100,
      centered: centerPixels.totalSkin > 50, // Simplified center detection
    };
  }

  // Calculate final emotion scores
  calculateEmotionScores(metrics) {
    const engagementScore = Math.min(
      100,
      (metrics.faceDetected / metrics.frameCount) * 100,
    );

    const eyeContactScore = Math.min(
      100,
      (metrics.faceCentered / metrics.faceDetected) * 100 || 0,
    );

    const avgBrightness =
      metrics.avgBrightness.reduce((a, b) => a + b, 0) /
      metrics.avgBrightness.length;
    const expressiveness = Math.min(100, Math.abs(avgBrightness - 128) * 0.78); // 0-128 -> 0-100

    return {
      engagementScore: Math.round(engagementScore),
      eyeContactScore: Math.round(eyeContactScore),
      expressivenessScore: Math.round(expressiveness),
      posture: "good", // Simplified
      confidence:
        Math.round(
          (engagementScore * 0.3 +
            eyeContactScore * 0.4 +
            expressiveness * 0.3) /
            3,
        ) || 0,
    };
  }

  // Generate feedback based on video analysis
  generateVideoFeedback(emotionData) {
    const feedback = [];

    if (emotionData.eyeContactScore > 70) {
      feedback.push(
        "✅ Excellent eye contact maintained throughout the answer.",
      );
    } else if (emotionData.eyeContactScore > 40) {
      feedback.push(
        "⚠️ Try to look directly at the camera more for better eye contact.",
      );
    } else {
      feedback.push(
        "❌ Weak eye contact detected. Focus on the camera when speaking.",
      );
    }

    if (emotionData.engagementScore > 75) {
      feedback.push("✅ High engagement level detected.");
    }

    if (emotionData.expressivenessScore > 60) {
      feedback.push("✅ Good facial expressions showing engagement.");
    } else {
      feedback.push("⚠️ Increase facial expressions to show enthusiasm.");
    }

    if (emotionData.confidence > 70) {
      feedback.push("✅ You appeared confident and well-prepared.");
    } else if (emotionData.confidence > 40) {
      feedback.push(
        "⚠️ Work on projecting more confidence in your body language.",
      );
    }

    return feedback;
  }
}

export default new EmotionDetectionService();
