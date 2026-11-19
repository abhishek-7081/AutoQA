const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const { analyzeVideoWithScript } = require('./analyzer');
const { extractScriptText } = require('./scriptParser');
const { SAMPLE_ANALYSIS_REPORT, SAMPLE_SCRIPT } = require('./sampleData');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitized);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for local upload
  },
});

// Serve uploaded video files with HTTP 206 Partial Content support for seeking
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'video/mp4';
  if (ext === '.webm') contentType = 'video/webm';
  if (ext === '.mov') contentType = 'video/quicktime';
  if (ext === '.mkv') contentType = 'video/x-matroska';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Sample Demo endpoint
app.get('/api/sample-demo', (req, res) => {
  res.json({
    script: SAMPLE_SCRIPT,
    report: SAMPLE_ANALYSIS_REPORT,
    videoUrl: null, // Client uses interactive synthetic/sample player when no local file exists
  });
});

// Extract script text from uploaded document
app.post('/api/extract-script', upload.single('scriptFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No script file provided' });
    }
    const scriptText = await extractScriptText(req.file, req.file.originalname);
    res.json({ scriptText });
  } catch (error) {
    console.error('Error extracting script:', error);
    res.status(500).json({ error: error.message || 'Failed to extract script' });
  }
});

// Main Analysis Endpoint
app.post(
  '/api/analyze',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'scriptFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const videoFile = req.files && req.files.video ? req.files.video[0] : null;
      const scriptFile = req.files && req.files.scriptFile ? req.files.scriptFile[0] : null;
      let scriptText = req.body.scriptText || '';
      const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
      const model = req.body.model || 'gemini-2.5-flash';
      const strictness = req.body.strictness || 'balanced';

      if (!videoFile) {
        return res.status(400).json({ error: 'Video file is required' });
      }

      // If script is provided as a file, extract its text
      if (scriptFile) {
        scriptText = await extractScriptText(scriptFile, scriptFile.originalname);
      }

      if (!scriptText || !scriptText.trim()) {
        return res.status(400).json({ error: 'Script content is required (either text or file)' });
      }

      const videoUrl = `/uploads/${videoFile.filename}`;

      console.log(`Starting QA analysis for: ${videoFile.originalname} using model: ${model}`);

      const report = await analyzeVideoWithScript({
        videoPath: videoFile.path,
        videoMimeType: videoFile.mimetype || 'video/mp4',
        videoOriginalName: videoFile.originalname,
        scriptText,
        apiKey,
        model,
        strictness,
        onProgress: (status) => {
          console.log(`[QA Progress] ${status.step}: ${status.message}`);
        },
      });

      res.json({
        success: true,
        report,
        videoUrl,
        originalVideoName: videoFile.originalname,
        scriptText,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Video analysis failed',
      });
    }
  }
);

// Serve static client build if dist exists
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start server if directly executed
if (require.main === module) {
  function startServerWithFallback(portToTry) {
    const server = app.listen(portToTry, '0.0.0.0', () => {
      console.log(`\n==================================================`);
      console.log(` AutoQA Server is READY and LISTENING!`);
      console.log(` Local URL: http://localhost:${portToTry}`);
      console.log(` Network URL: http://127.0.0.1:${portToTry}`);
      console.log(`==================================================\n`);
    });

    server.on('error', (err) => {
      if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && portToTry !== 5001) {
        console.warn(`Port ${portToTry} encountered ${err.code}. Automatically falling back to port 5001...`);
        startServerWithFallback(5001);
      } else if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && portToTry === 5001) {
        console.warn(`Port 5001 encountered ${err.code}. Automatically falling back to port 8080...`);
        startServerWithFallback(8080);
      } else {
        console.error('Server listen error:', err);
      }
    });

    // Ensure process stays active indefinitely
    const keepAlive = setInterval(() => {}, 60000);

    process.on('SIGINT', () => {
      clearInterval(keepAlive);
      server.close(() => process.exit(0));
    });

    process.on('SIGTERM', () => {
      clearInterval(keepAlive);
      server.close(() => process.exit(0));
    });
  }

  const initialPort = parseInt(PORT, 10) || 5001;
  startServerWithFallback(initialPort);
}

module.exports = app;
