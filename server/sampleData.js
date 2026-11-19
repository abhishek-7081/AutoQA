/**
 * Production-quality sample verification report adhering to all prompt specifications:
 * Second-by-second timestamps, expected vs actual, 8 issue categories,
 * chronological timeline sections, and actionable recommendations.
 */

const SAMPLE_SCRIPT = `Title: NextGen AI Cloud Suite - Product Overview Video (Duration: ~2m 30s)

[00:00 - 00:15]
VISUAL: High-tech 3D animated logo reveal with soft blue ambient glow.
NARRATOR (VO): "In today's fast-moving digital world, enterprise agility is no longer optional."

[00:15 - 00:30]
VISUAL: Cut to host in modern studio standing beside a digital interactive display.
NARRATOR: "Welcome to our platform. Today we will explore how the NextGen AI Cloud Suite empowers modern engineering teams."

[00:30 - 00:50]
VISUAL: Split screen showing cloud architecture metrics and real-time collaboration.
NARRATOR: "Our services are available worldwide with ninety-nine point nine nine percent guaranteed uptime. You can deploy across multiple regions in seconds."

[00:50 - 01:10]
VISUAL: Continuous smooth transition to automated continuous integration pipelines.
NARRATOR: "Every commit automatically runs through automated compliance, security scanning, and seamless rollback protocols without manual friction."

[01:10 - 01:25]
VISUAL: Zoom in on global latency map showcasing low-latency nodes.
NARRATOR: "With ubiquitous edge nodes operating across six continents, latency drops to single-digit milliseconds for your end users."

[01:25 - 01:45]
VISUAL: Product demonstration scene showing the interactive analytics dashboard, live charts, and user permission management console.
NARRATOR: "Here on the live dashboard, administrators can monitor active workloads, track budget utilization, and manage access tokens in one unified pane."

[01:45 - 02:00]
VISUAL: Step-by-step 3-point animated infographic highlighting: 1. Instant Setup, 2. SOC-2 Compliance, 3. 24/7 Dedicated Support.
NARRATOR: "Getting started requires three simple steps: link your repository, configure environment variables, and hit deploy."

[02:00 - 02:20]
VISUAL: Host returns on camera speaking directly to the audience with product web URL lower-third graphic.
NARRATOR: "Experience the next level of cloud scalability today. Visit cloud.nextgen.io to begin your 30-day enterprise trial."

[02:20 - 02:30]
VISUAL: Outro title card with corporate branding, partner logos, and contact email.
NARRATOR (VO): "NextGen AI Cloud. Engineered for tomorrow, ready today."
`;

const SAMPLE_ANALYSIS_REPORT = {
  metadata: {
    videoTitle: "NextGen_AI_Cloud_Suite_v2_Cut.mp4",
    videoDurationSeconds: 150,
    videoDurationFormatted: "02:30",
    analyzedAt: new Date().toISOString(),
    engine: "Gemini 2.5 Flash Multimodal QA Engine",
    scriptWordCount: 228,
  },
  assessment: {
    overallAccuracyPercentage: 82,
    scriptAdherencePercentage: 76,
    audioQualityScore: 85,
    audioQualityRating: "Good",
    audioQualityNotes: "Clear acoustic presence and voice clarity throughout, but interrupted by an unscripted 5-second dead air pause at 00:54 and minor lip-sync drift at 02:05.",
    visualConsistencyScore: 78,
    visualConsistencyRating: "Fair",
    visualConsistencyNotes: "Intro and outro visuals match brand guidelines well. However, the product demonstration at 01:28 was replaced with an unrelated nature graphic, and the 3-point infographic at 01:45 was missing.",
    totalIssues: 8,
    severityBreakdown: {
      critical: 3,
      warning: 3,
      minor: 2,
    },
    overallStatus: "Needs Improvement", // Approved | Needs Improvement | Rejected
    statusReason: "The video contains 3 critical discrepancies (omitted welcome greeting, off-topic visual demonstration, and missing animated infographic) along with an unapproved YouTube-style ad-lib. Audio quality is generally high but requires targeted editorial fixes.",
    executiveSummary: "While the production value and core vocal delivery of the video are strong, the presentation deviates from the client-approved script at multiple key junctures. Notably, the presenter omitted the formal platform welcome at 00:15, altered approved corporate terminology at 00:32, suffered a 5-second silence gap at 00:54, and substituted live product UI with unrelated generic stock footage at 01:28. The video is not ready for final release in its current form and requires the editorial revisions detailed in this report."
  },
  categorySummary: {
    missing_dialogue: { count: 1, label: "Missing Dialogue", severity: "critical" },
    script_mismatch: { count: 1, label: "Script Mismatch", severity: "warning" },
    audio_issue: { count: 1, label: "Audio Issues & Silences", severity: "warning" },
    pronunciation_error: { count: 1, label: "Pronunciation Errors", severity: "minor" },
    visual_mismatch: { count: 1, label: "Visual Mismatches", severity: "critical" },
    missing_scene: { count: 1, label: "Missing Scenes / Visuals", severity: "critical" },
    sync_issue: { count: 1, label: "Timing & Sync Issues", severity: "warning" },
    extra_dialogue: { count: 1, label: "Extra / Unexpected Dialogue", severity: "minor" },
  },
  issues: [
    {
      id: "ISS-001",
      startTimestamp: "00:15",
      endTimestamp: "00:19",
      startSeconds: 15,
      endSeconds: 19,
      category: "missing_dialogue",
      categoryLabel: "Missing Dialogue",
      severity: "critical",
      confidence: "confirmed",
      title: "Missing Platform Welcome Greeting",
      description: "The speaker skipped the opening formal greeting sentence required by the marketing script.",
      expectedContent: "\"Welcome to our platform. Today we will explore...\"",
      actualContent: "\"Today we will explore...\" (The phrase 'Welcome to our platform' was completely omitted)",
      suggestedCorrection: "Insert the missing audio pickup or re-record the host's opening sentence including 'Welcome to our platform'."
    },
    {
      id: "ISS-002",
      startTimestamp: "00:32",
      endTimestamp: "00:37",
      startSeconds: 32,
      endSeconds: 37,
      category: "script_mismatch",
      categoryLabel: "Script Mismatch",
      severity: "warning",
      confidence: "confirmed",
      title: "Inaccurate Phrasing of Global Availability",
      description: "The speaker substituted approved corporate phrasing 'worldwide' with casual synonym 'everywhere'.",
      expectedContent: "\"Our services are available worldwide with ninety-nine point nine nine percent guaranteed uptime.\"",
      actualContent: "\"Our services are available everywhere with 99.99% guaranteed uptime.\"",
      suggestedCorrection: "If exact contract-approved terminology is mandatory for legal compliance, replace audio with 'worldwide'."
    },
    {
      id: "ISS-003",
      startTimestamp: "00:54",
      endTimestamp: "00:59",
      startSeconds: 54,
      endSeconds: 59,
      category: "audio_issue",
      categoryLabel: "Audio / Long Silence",
      severity: "warning",
      confidence: "confirmed",
      title: "Awkward 5-Second Dead Air Silence",
      description: "A continuous voiceover narration was expected between CI/CD pipeline benefits, but a 5-second gap of complete silence occurred.",
      expectedContent: "Continuous smooth narration accompanying pipeline animations.",
      actualContent: "5.1 seconds of dead air with faint ambient background room tone and no narration.",
      suggestedCorrection: "Ripple-delete the dead silence in the editing timeline or bridge with subtle background music bed."
    },
    {
      id: "ISS-004",
      startTimestamp: "01:12",
      endTimestamp: "01:16",
      startSeconds: 112,
      endSeconds: 116,
      category: "pronunciation_error",
      categoryLabel: "Pronunciation Error",
      severity: "minor",
      confidence: "confirmed",
      title: "Mispronunciation of Technical Term 'Ubiquitous'",
      description: "The narrator mispronounced the word 'ubiquitous', pronouncing it phonetically as 'u-bick-wee-tus'.",
      expectedContent: "\"With ubiquitous edge nodes operating across six continents...\" (/juːˈbɪk.wɪ.təs/)",
      actualContent: "\"With u-bick-wee-tus edge nodes operating...\"",
      suggestedCorrection: "Patch in a clean vocal punch-in with standard pronunciation (/juːˈbɪk.wɪ.təs/)."
    },
    {
      id: "ISS-005",
      startTimestamp: "01:28",
      endTimestamp: "01:34",
      startSeconds: 88,
      endSeconds: 94,
      category: "visual_mismatch",
      categoryLabel: "Visual Mismatch",
      severity: "critical",
      confidence: "confirmed",
      title: "Unrelated Stock Footage in Place of Dashboard Demo",
      description: "The script specifies an active product demonstration showing the analytics dashboard and permissions console. Instead, unrelated mountain landscape B-roll is displayed.",
      expectedContent: "Product demonstration scene: interactive analytics dashboard, live charts, user permission console.",
      actualContent: "Generic stock video of mountains and sunrise; zero software interface visible.",
      suggestedCorrection: "Cut to the actual recorded screen capture of the NextGen AI analytics dashboard as specified in the storyboard."
    },
    {
      id: "ISS-006",
      startTimestamp: "01:45",
      endTimestamp: "01:52",
      startSeconds: 105,
      endSeconds: 112,
      category: "missing_scene",
      categoryLabel: "Missing Scene / Visual",
      severity: "critical",
      confidence: "confirmed",
      title: "Missing 3-Point Animated Infographic",
      description: "The script specifies a step-by-step 3-point animated infographic (Instant Setup, SOC-2, 24/7 Support). The video remains stuck on a static title card.",
      expectedContent: "Step-by-step animated infographic detailing: 1. Instant Setup, 2. SOC-2 Compliance, 3. 24/7 Dedicated Support.",
      actualContent: "Static frozen graphic of the company logo without animation or text bullet points.",
      suggestedCorrection: "Render and insert the 3-point motion graphic asset into this 7-second time window."
    },
    {
      id: "ISS-007",
      startTimestamp: "02:05",
      endTimestamp: "02:10",
      startSeconds: 125,
      endSeconds: 130,
      category: "sync_issue",
      categoryLabel: "Timing & Sync Issues",
      severity: "warning",
      confidence: "confirmed",
      title: "Audio-Video Lip-Sync Delay (~500ms)",
      description: "When cutting back to the on-camera presenter, vocal audio leads lip movement by approximately 500 milliseconds.",
      expectedContent: "Accurate lip-synchronization with host dialogue.",
      actualContent: "Noticeable audio-lead sync drift; mouth continues moving half a second after voice finishes sentence.",
      suggestedCorrection: "Nudge audio track by -500ms on the timeline between cut point 02:00 and 02:20 to re-align lip sync."
    },
    {
      id: "ISS-008",
      startTimestamp: "02:22",
      endTimestamp: "02:28",
      startSeconds: 142,
      endSeconds: 148,
      category: "extra_dialogue",
      categoryLabel: "Extra / Unexpected Dialogue",
      severity: "minor",
      confidence: "confirmed",
      title: "Unapproved Social Media Ad-Lib",
      description: "The presenter adds an ad-libbed call to action that is not present in the corporate product script.",
      expectedContent: "Silent outro visual or scripted voiceover: 'NextGen AI Cloud. Engineered for tomorrow, ready today.'",
      actualContent: "Presenter shouts: 'And remember guys, smash that like button and subscribe for more tech tips!'",
      suggestedCorrection: "Mute or remove the unapproved ad-lib audio clip to preserve executive enterprise tone."
    }
  ],
  timelineSections: [
    {
      sectionId: "SEC-01",
      timeRange: "00:00 – 00:30",
      startSeconds: 0,
      endSeconds: 30,
      whatIsHappening: "3D logo animation plays followed by studio host introduction to NextGen AI Cloud Suite.",
      scriptExpectation: "Logo reveal with voiceover followed by host welcoming users and introducing platform agility.",
      status: "partial",
      adherenceScore: 78,
      detectedErrors: [
        "ISS-001 (00:15–00:19): Missing 'Welcome to our platform' greeting"
      ],
      notes: "High aesthetic quality in 3D animation, but host skipped key welcome greeting."
    },
    {
      sectionId: "SEC-02",
      timeRange: "00:30 – 01:00",
      startSeconds: 30,
      endSeconds: 60,
      whatIsHappening: "Split screen cloud metrics display followed by automated CI/CD pipeline showcase.",
      scriptExpectation: "Global availability announcement ('worldwide', 99.99% uptime) followed by continuous integration feature walk-through.",
      status: "partial",
      adherenceScore: 74,
      detectedErrors: [
        "ISS-002 (00:32–00:37): Spoken 'everywhere' instead of 'worldwide'",
        "ISS-003 (00:54–00:59): 5-second dead air silence between feature descriptions"
      ],
      notes: "Graphics are visually sharp; phrasing substitution is minor, but the dead air pause is disruptive."
    },
    {
      sectionId: "SEC-03",
      timeRange: "01:00 – 01:30",
      startSeconds: 60,
      endSeconds: 90,
      whatIsHappening: "Global latency map display transitioning into a scenic nature stock clip.",
      scriptExpectation: "Latency discussion highlighting ubiquitous edge nodes, followed by live analytics dashboard demonstration.",
      status: "diverged",
      adherenceScore: 65,
      detectedErrors: [
        "ISS-004 (01:12–01:16): Mispronunciation of 'ubiquitous'",
        "ISS-005 (01:28–01:34): Visual mismatch: nature stock footage instead of product dashboard"
      ],
      notes: "Major visual discrepancy starting at 01:28; viewer cannot see the product interface described."
    },
    {
      sectionId: "SEC-04",
      timeRange: "01:30 – 02:00",
      startSeconds: 90,
      endSeconds: 120,
      whatIsHappening: "Narration continues discussing 3 simple setup steps while video shows a static logo slide.",
      scriptExpectation: "Animated 3-point infographic visual (Instant Setup, SOC-2, 24/7 Dedicated Support).",
      status: "diverged",
      adherenceScore: 60,
      detectedErrors: [
        "ISS-006 (01:45–01:52): Missing 3-point animated infographic"
      ],
      notes: "The visual content completely stalls on a freeze frame, failing to display the 3 points explained in audio."
    },
    {
      sectionId: "SEC-05",
      timeRange: "02:00 – 02:30",
      startSeconds: 120,
      endSeconds: 150,
      whatIsHappening: "Host returns on camera providing call to action, followed by corporate outro and unscripted ad-lib.",
      scriptExpectation: "Direct-to-camera CTA with lower-third trial link, ending with branded corporate tagline.",
      status: "partial",
      adherenceScore: 75,
      detectedErrors: [
        "ISS-007 (02:05–02:10): Audio-video lip-sync delay (~500ms)",
        "ISS-008 (02:22–02:28): Unapproved YouTube-style ad-lib ('smash that like button')"
      ],
      notes: "Lip sync offset is perceptible; inappropriate casual ad-lib undermines corporate branding."
    }
  ],
  recommendations: [
    {
      id: "REC-001",
      targetRole: "Video Editor",
      priority: "High",
      area: "Visual Demonstration (01:28)",
      recommendation: "Replace the placeholder nature B-roll from 01:28 to 01:34 with recorded screen capture of the analytics dashboard and permissions console."
    },
    {
      id: "REC-002",
      targetRole: "Motion Graphics Designer",
      priority: "High",
      area: "Infographic Asset (01:45)",
      recommendation: "Build and render the 3-point animated motion graphic illustrating Instant Setup, SOC-2, and 24/7 Support to replace the static freeze frame."
    },
    {
      id: "REC-003",
      targetRole: "Audio Engineer / Editor",
      priority: "High",
      area: "Dead Air Silence (00:54)",
      recommendation: "Trim the 5.1-second dead space at 00:54. Shift subsequent clips forward or add a low-volume ambient corporate audio pad to maintain pacing."
    },
    {
      id: "REC-004",
      targetRole: "Video Editor",
      priority: "Medium",
      area: "Lip Sync Calibration (02:05)",
      recommendation: "Shift the dialogue audio track by -500ms for the on-camera presenter segment between 02:00 and 02:20 to eliminate visible mouth-audio lag."
    },
    {
      id: "REC-005",
      targetRole: "Voice Talent / Producer",
      priority: "Medium",
      area: "Dialogue Pickups (00:15 & 01:12)",
      recommendation: "Record brief pickups for the missing welcome greeting ('Welcome to our platform') and correct pronunciation of 'ubiquitous' (/juːˈbɪk.wɪ.təs/)."
    },
    {
      id: "REC-006",
      targetRole: "Audio Editor",
      priority: "Low",
      area: "Outro Ad-lib (02:22)",
      recommendation: "Mute or remove the colloquial 'smash that like button' outro line to conform with corporate enterprise video standards."
    }
  ]
};

module.exports = {
  SAMPLE_SCRIPT,
  SAMPLE_ANALYSIS_REPORT,
};
