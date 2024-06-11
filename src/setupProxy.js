// path: src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.webflow.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to target
      },
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_WEBFLOW_API_TOKEN}`,
        'Accept-Version': '1.0.0',
      },
    })
  );
};