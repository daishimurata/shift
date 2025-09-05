// api/simple-test.js
// シンプルなLINE WORKS接続テスト

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
    const hasClientId = !!process.env.LINEWORKS_CLIENT_ID;
    const hasClientSecret = !!process.env.LINEWORKS_CLIENT_SECRET;
    const hasServiceAccount = !!process.env.LINEWORKS_SERVICE_ACCOUNT_ID;
    const hasPrivateKey = !!process.env.LINEWORKS_PRIVATE_KEY;

    // 基本的なHTTPリクエストテスト
    const testResponse = await fetch('https://www.worksapis.com/v1.0/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.LINEWORKS_CLIENT_ID}:${process.env.LINEWORKS_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const testResult = await testResponse.text();

    res.status(200).json({
      success: true,
      message: "シンプルテスト完了",
      environment: {
        hasClientId,
        hasClientSecret,
        hasServiceAccount,
        hasPrivateKey
      },
      testResponse: {
        status: testResponse.status,
        statusText: testResponse.statusText,
        body: testResult.substring(0, 200) // 最初の200文字のみ
      },
      date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('シンプルテストエラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500), // スタックトレースの最初の500文字のみ
      date: new Date().toISOString()
    });
  }
}
