// api/debug.js
// デバッグ用API

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // OPTIONSリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 環境変数の確認
    const envCheck = {
      LINEWORKS_CLIENT_ID: process.env.LINEWORKS_CLIENT_ID ? '設定済み' : '未設定',
      LINEWORKS_CLIENT_SECRET: process.env.LINEWORKS_CLIENT_SECRET ? '設定済み' : '未設定',
      LINEWORKS_SERVICE_ACCOUNT_ID: process.env.LINEWORKS_SERVICE_ACCOUNT_ID ? '設定済み' : '未設定',
      LINEWORKS_PRIVATE_KEY: process.env.LINEWORKS_PRIVATE_KEY ? '設定済み' : '未設定',
      NODE_ENV: process.env.NODE_ENV || '未設定'
    };

    res.status(200).json({
      success: true,
      message: "デバッグ情報",
      environment: envCheck,
      date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('デバッグAPI エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
