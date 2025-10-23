// Cloud Vision API - Doodle Analysis
import { onRequest } from 'firebase-functions/v2/https';
import vision from '@google-cloud/vision';

export const analyzeDoodle = onRequest({ 
  cors: true,
  timeoutSeconds: 30,
}, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.annotateImage({
      image: { content: imageBase64 },
      features: [
        { type: 'IMAGE_PROPERTIES' },
        { type: 'LABEL_DETECTION' },
        { type: 'FACE_DETECTION' },
      ],
    });
    
    // Extract dominant colors
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const labels = result.labelAnnotations?.map(l => l.description) || [];
    const faces = result.faceAnnotations || [];
    
    // Analyze mood from colors
    const avgBrightness = colors.reduce((sum, c) => {
      const brightness = (c.color.red + c.color.green + c.color.blue) / 3;
      return sum + brightness;
    }, 0) / (colors.length || 1);
    
    const warmColors = colors.filter(c => c.color.red > c.color.blue).length;
    const coolColors = colors.filter(c => c.color.blue > c.color.red).length;
    const darkColors = colors.filter(c => 
      c.color.red < 100 && c.color.green < 100 && c.color.blue < 100
    ).length;
    
    // Determine mood based on color analysis
    let mood = 'calm';
    let confidence = 0.7;
    
    if (avgBrightness > 180 && warmColors > coolColors) {
      mood = 'happy';
      confidence = 0.85;
    } else if (avgBrightness < 80 || darkColors > colors.length * 0.6) {
      mood = 'sad';
      confidence = 0.8;
    } else if (coolColors > warmColors && avgBrightness < 150) {
      mood = 'anxious';
      confidence = 0.75;
    } else if (warmColors > coolColors) {
      mood = 'stressed';
      confidence = 0.7;
    }
    
    // Check for emotional labels
    const emotionalLabels = labels.filter(l => 
      ['happy', 'sad', 'angry', 'peaceful', 'chaotic', 'calm', 'stressed'].some(e => 
        l.toLowerCase().includes(e)
      )
    );
    
    // Adjust mood based on labels
    if (emotionalLabels.length > 0) {
      const label = emotionalLabels[0].toLowerCase();
      if (label.includes('happy')) mood = 'happy';
      else if (label.includes('sad')) mood = 'sad';
      else if (label.includes('calm') || label.includes('peaceful')) mood = 'calm';
      confidence = 0.9;
    }
    
    // Check for faces and emotions
    if (faces.length > 0) {
      const face = faces[0];
      if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY') {
        mood = 'happy';
        confidence = 0.95;
      } else if (face.sorrowLikelihood === 'VERY_LIKELY' || face.sorrowLikelihood === 'LIKELY') {
        mood = 'sad';
        confidence = 0.95;
      } else if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY') {
        mood = 'stressed';
        confidence = 0.95;
      }
    }
    
    res.json({
      mood,
      confidence,
      labels: labels.slice(0, 5),
      analysis: {
        brightness: Math.round(avgBrightness),
        warmColors,
        coolColors,
        darkColors,
        totalColors: colors.length,
        hasFaces: faces.length > 0,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Doodle analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze doodle',
      details: error.message 
    });
  }
});
