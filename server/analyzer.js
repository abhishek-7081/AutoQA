const { GoogleGenAI, FileState } = require('@google/genai');
const fs = require('fs');

/**
 * Helper to convert seconds into MM:SS format
 */
function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Runs complete AI video and script verification using Google Gemini Multimodal File API.
 */
async function analyzeVideoWithScript({
  videoPath,
  videoMimeType = 'video/mp4',
  videoOriginalName = 'video.mp4',
  scriptText,
  apiKey,
  model = 'gemini-2.5-flash',
  strictness = 'balanced',
  onProgress = () => {},
}) {
  const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!activeApiKey) {
    throw new Error(
      'Gemini API key is required. Please set GEMINI_API_KEY in your environment or provide it in the API key settings modal.'
    );
  }

  onProgress({ step: 'init', message: 'Initializing Gemini Multimodal Engine...' });
  const ai = new GoogleGenAI({ apiKey: activeApiKey });

  // 1. Upload video file to Gemini File API
  onProgress({ step: 'uploading', message: 'Uploading video to Gemini File API for frame & audio analysis...' });
  let uploadResult;
  try {
    uploadResult = await ai.files.upload({
      file: videoPath,
      config: {
        mimeType: videoMimeType,
        displayName: videoOriginalName,
      },
    });
  } catch (err) {
    throw new Error(`Failed to upload video to Gemini File API: ${err.message}`);
  }

  const fileName = uploadResult.name;

  // 2. Poll until video processing is completed
  onProgress({ step: 'processing', message: 'Processing video audio and visual tracks on Gemini servers...' });
  let fileInfo = await ai.files.get({ name: fileName });
  let attempts = 0;
  const maxAttempts = 60; // Up to 2 minutes

  while (fileInfo.state === FileState.PROCESSING && attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    fileInfo = await ai.files.get({ name: fileName });
    onProgress({
      step: 'processing',
      message: `Analyzing video frames and audio track (attempt ${attempts})...`,
    });
  }

  if (fileInfo.state === FileState.FAILED) {
    await ai.files.delete({ name: fileName }).catch(() => {});
    throw new Error('Gemini failed to process the video stream.');
  }

  if (fileInfo.state !== FileState.ACTIVE) {
    await ai.files.delete({ name: fileName }).catch(() => {});
    throw new Error(`Unexpected video processing state: ${fileInfo.state}`);
  }

  // 3. Prompt engineering with structured output
  onProgress({
    step: 'analyzing',
    message: 'Comparing spoken dialogue, audio cadence, visual scenes, and timeline against script...',
  });

  const prompt = `
You are an expert AI Video Quality Assurance & Script Verification Auditor.
Your job is to thoroughly analyze the uploaded video from start to finish and compare it against the provided original script.

=== ORIGINAL SCRIPT ===
${scriptText}
=======================

STRICTNESS MODE: ${strictness}
- If strict: Any wording variation or missing visual element must be marked as an issue.
- If balanced: Distinguish between actual errors vs acceptable natural speech variations (do not flag harmless natural synonyms unless corporate terminology or instructions strictly require it).
- If lenient: Only flag significant omissions, errors, or visual breaks.

CORE ANALYSIS REQUIREMENTS:
1. Spoken Dialogue Matching:
   - Does spoken dialogue match the script?
   - Identify missing sentences, words, paragraphs, or dialogues.
   - Identify additional or unexpected dialogue not present in the script.
   - Detect incorrect pronunciation or unclear speech.
   - Identify words or sentences spoken in the wrong order.
2. Audio Analysis:
   - Unnecessary pauses, long silences (>= 3s), abrupt audio cuts, or interruptions.
   - Audio and video synchronization issues (lip-sync delays or offsets).
3. Visual Analysis:
   - Visual inconsistencies between the video and the script (e.g., script specifies product demo, but unrelated visual appears).
   - Missing scenes or visuals that should have appeared according to the script cues.
   - Static/frozen visual sections where motion or graphics were expected.
4. Second-by-Second Video Analysis:
   - Analyze the entire video from beginning to end without skipping any part.
   - For every identified issue, provide PRECISE timestamps (e.g., 00:15 - 00:19), startSeconds, endSeconds.
   - Never provide vague observations.
   - Distinguish confirmed issues from potential issues.
   - Never fabricate errors.
5. Chronological Timeline Sections:
   - Divide the entire video chronologically into sections (covering every minute and relevant segment).
   - Describe what is happening, what script expects, whether it follows script (follows, partial, diverged), and issues detected.
6. Overall Assessment & Recommendations:
   - Overall accuracy % (0-100)
   - Script adherence % (0-100)
   - Audio quality score (0-100), rating, and notes
   - Visual consistency score (0-100), rating, and notes
   - Total issues count
   - Overall status: "Approved" | "Needs Improvement" | "Rejected"
   - Status reason and executive summary
   - Concrete, actionable recommendations for video editors, audio engineers, and voice talent.

Output your complete evaluation ONLY as a valid JSON object matching the following structure:
{
  "assessment": {
    "overallAccuracyPercentage": number,
    "scriptAdherencePercentage": number,
    "audioQualityScore": number,
    "audioQualityRating": "Excellent" | "Good" | "Fair" | "Poor",
    "audioQualityNotes": string,
    "visualConsistencyScore": number,
    "visualConsistencyRating": "Excellent" | "Good" | "Fair" | "Poor",
    "visualConsistencyNotes": string,
    "totalIssues": number,
    "overallStatus": "Approved" | "Needs Improvement" | "Rejected",
    "statusReason": string,
    "executiveSummary": string
  },
  "issues": [
    {
      "id": string,
      "startTimestamp": "MM:SS",
      "endTimestamp": "MM:SS",
      "startSeconds": number,
      "endSeconds": number,
      "category": "script_mismatch" | "missing_dialogue" | "extra_dialogue" | "pronunciation_error" | "audio_issue" | "visual_mismatch" | "missing_scene" | "sync_issue" | "other_inconsistency",
      "categoryLabel": string,
      "severity": "critical" | "warning" | "minor",
      "confidence": "confirmed" | "potential",
      "title": string,
      "description": string,
      "expectedContent": string,
      "actualContent": string,
      "suggestedCorrection": string
    }
  ],
  "timelineSections": [
    {
      "sectionId": string,
      "timeRange": "MM:SS – MM:SS",
      "startSeconds": number,
      "endSeconds": number,
      "whatIsHappening": string,
      "scriptExpectation": string,
      "status": "follows" | "partial" | "diverged",
      "adherenceScore": number,
      "detectedErrors": [string],
      "notes": string
    }
  ],
  "recommendations": [
    {
      "id": string,
      "targetRole": string,
      "priority": "High" | "Medium" | "Low",
      "area": string,
      "recommendation": string
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                fileUri: fileInfo.uri,
                mimeType: fileInfo.mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high precision and factual grounding
      },
    });

    onProgress({ step: 'finalizing', message: 'Parsing analysis results and formatting report...' });

    let rawText = response.text || '';
    // Clean code fences if present
    rawText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      throw new Error(`Model returned malformed JSON: ${parseErr.message}`);
    }

    // Enhance and validate data structure
    parsedResult.metadata = {
      videoTitle: videoOriginalName,
      analyzedAt: new Date().toISOString(),
      engine: `${model} Multimodal QA Engine`,
      scriptWordCount: scriptText.trim().split(/\s+/).length,
    };

    // Calculate category summary
    const categorySummary = {
      missing_dialogue: { count: 0, label: 'Missing Dialogue', severity: 'critical' },
      script_mismatch: { count: 0, label: 'Script Mismatch', severity: 'warning' },
      audio_issue: { count: 0, label: 'Audio Issues & Silences', severity: 'warning' },
      pronunciation_error: { count: 0, label: 'Pronunciation Errors', severity: 'minor' },
      visual_mismatch: { count: 0, label: 'Visual Mismatches', severity: 'critical' },
      missing_scene: { count: 0, label: 'Missing Scenes / Visuals', severity: 'critical' },
      sync_issue: { count: 0, label: 'Timing & Sync Issues', severity: 'warning' },
      extra_dialogue: { count: 0, label: 'Extra / Unexpected Dialogue', severity: 'minor' },
      other_inconsistency: { count: 0, label: 'Other Inconsistencies', severity: 'minor' },
    };

    if (Array.isArray(parsedResult.issues)) {
      parsedResult.issues.forEach((iss, index) => {
        if (!iss.id) iss.id = `ISS-${String(index + 1).padStart(3, '0')}`;
        const cat = iss.category || 'other_inconsistency';
        if (categorySummary[cat]) {
          categorySummary[cat].count += 1;
        } else {
          categorySummary[cat] = { count: 1, label: iss.categoryLabel || cat, severity: iss.severity || 'warning' };
        }
      });
      parsedResult.assessment.totalIssues = parsedResult.issues.length;
    }

    parsedResult.categorySummary = categorySummary;

    return parsedResult;
  } finally {
    // Delete file from Gemini server to clean up
    ai.files.delete({ name: fileName }).catch((delErr) => {
      console.warn('Note: Could not delete temporary Gemini file:', delErr.message);
    });
  }
}

module.exports = {
  analyzeVideoWithScript,
};
