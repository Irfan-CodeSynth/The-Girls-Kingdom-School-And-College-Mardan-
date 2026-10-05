let app;
try {
  app = require('./src/app');
} catch (err) {
  console.error('CRITICAL BACKEND STARTUP ERROR:', err);
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Backend Initialization Failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });
}

if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
module.exports.default = app;
