// api/send-matsumoto.js
// 松本愛美さん専用メッセージ送信API（Vercel Pro対応）

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 松本愛美さん専用設定
    const matsumotoInfo = {
      name: "松本愛美",
      email: "oh.47553@ohisamafarm",
      role: "サービス管理責任者（サブ）",
      nickname: "あいちゃん"
    };

    const customMessage = req.query.message || req.body?.message;
    
    const defaultMessage = `お疲れさまです、あいちゃん！

サービス管理責任者実践訓練中、
個別支援計画・面談担当として
いつもお疲れさまです。

松本愛美さん専用APIが正常に動作しています。
新システムの確認をお願いします。`;

    const messageText = customMessage || defaultMessage;
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('認証失敗');

    const result = await sendBotMessage(accessToken, matsumotoInfo.email, messageText);
    
    return res.status(200).json({
      success: result.success,
      message: result.success ? "✅ 松本愛美さんにメッセージ送信完了！" : "❌ 送信失敗",
      data: {
        target: matsumotoInfo,
        messageType: customMessage ? "カスタムメッセージ" : "デフォルトメッセージ",
        deliveryStatus: result.success ? "配信成功" : "配信失敗",
        status: result.status,
        botName: "日向",
        apiType: "個別専用API（Vercel Pro対応）"
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      target: "松本愛美さん",
      timestamp: new Date().toISOString()
    });
  }
}

// Bot「日向」メッセージ送信・認証（共通部分）
async function sendBotMessage(accessToken, userEmail, message) {
  const formattedMessage = `${message}\n\n何かご質問がございましたら、\nいつでもお声がけくださいね。\n\n日向より\n${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  try {
    const messageContent = { content: { type: 'text', text: formattedMessage } };
    const response = await fetch(`https://www.worksapis.com/v1.0/bots/10746138/users/${encodeURIComponent(userEmail)}/messages`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(messageContent)
    });
    const responseData = await response.text();
    let apiResponse; try { apiResponse = JSON.parse(responseData); } catch { apiResponse = { raw: responseData }; }
    return { success: response.status === 200 || response.status === 201, status: response.status, apiResponse };
  } catch (error) { return { success: false, status: 500, error: error.message }; }
}

async function getAccessToken() {
  const clientId = process.env.LINEWORKS_CLIENT_ID; const clientSecret = process.env.LINEWORKS_CLIENT_SECRET;
  const serviceAccount = process.env.LINEWORKS_SERVICE_ACCOUNT_ID; const privateKey = process.env.LINEWORKS_PRIVATE_KEY;
  const now = Math.floor(Date.now() / 1000); const payload = { iss: clientId, sub: serviceAccount, iat: now, exp: now + 3600 };
  const assertion = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  const response = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', client_id: clientId, client_secret: clientSecret, scope: 'calendar,user.read,bot', assertion: assertion })
  });
  const responseData = await response.json(); return response.status === 200 ? responseData.access_token : null;
}
