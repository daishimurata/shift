// api/key-test.js
// Private Keyテスト用API

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
    const privateKey = process.env.LINEWORKS_PRIVATE_KEY;
    
    if (!privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Private Keyが設定されていません'
      });
    }

    // Private Keyの形式確認
    const hasBeginMarker = privateKey.includes('-----BEGIN PRIVATE KEY-----');
    const hasEndMarker = privateKey.includes('-----END PRIVATE KEY-----');
    const keyLength = privateKey.length;

    res.status(200).json({
      success: true,
      message: "Private Key確認完了",
      keyInfo: {
        hasBeginMarker,
        hasEndMarker,
        keyLength,
        firstLine: privateKey.split('\n')[0],
        lastLine: privateKey.split('\n').slice(-1)[0]
      },
      date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Private Keyテストエラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      date: new Date().toISOString()
    });
  }
}
