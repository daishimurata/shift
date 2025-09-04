// api/health.js
// 動作確認用の最小限のAPI

export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    message: 'APIは正常に動作しています',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Tokyo'
  });
}
