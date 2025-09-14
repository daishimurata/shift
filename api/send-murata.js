// api/send-murata.js
// 村田太志さん専用メッセージ送信API（Vercel Pro対応）

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
    // 村田太志さん専用設定
    const murataInfo = {
      name: "村田太志",
      email: "pr.12187@ohisamafarm",
      role: "職業指導員（サービス管理責任者）",
      nickname: "だいし"
    };

    // カスタムメッセージ取得（オプション）
    const customMessage = req.query.message || req.body?.message;
    
    const defaultMessage = `お疲れさまです、だいしさん！

Claude.aiプロジェクト制限回避のため、
村田太志さん専用APIを作成しました。

職業指導員・サービス管理責任者として、
いつも全体統括をありがとうございます。

このメッセージが届いていれば、
個別API機能が正常に動作しています。`;

    const messageText = customMessage || defaultMessage;

    // LINE WORKS認証
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('LINE WORKS認証に失敗しました');
    }

    // Bot「日向」経由でメッセージ送信
    const result = await sendBotMessage(accessToken, murataInfo.email, messageText);
    
    return res.status(200).json({
      success: result.success,
      message: result.success ? 
        "✅ 村田太志さんにメッセージ送信完了！" : 
        "❌ 村田太志さんへの送信に失敗しました",
      data: {
        target: murataInfo,
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
      target: "村田太志さん",
      apiType: "個別専用API",
      timestamp: new Date().toISOString()
    });
  }
}

// Bot「日向」メッセージ送信
async function sendBotMessage(accessToken, userEmail, message) {
  const formattedMessage = `${message}

何かご質問がございましたら、
いつでもお声がけくださいね。

日向より
${new Date().toLocaleString('ja-JP', { 
  timeZone: 'Asia/Tokyo', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}`;

  try {
    const messageContent = {
      content: {
        type: 'text',
        text: formattedMessage
      }
    };

    const response = await fetch(`https://www.worksapis.com/v1.0/bots/10746138/users/${encodeURIComponent(userEmail)}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageContent)
    });

    const responseData = await response.text();
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseData);
    } catch {
      apiResponse = { raw: responseData };
    }

    return {
      success: response.status === 200 || response.status === 201,
      status: response.status,
      apiResponse: apiResponse
    };

  } catch (error) {
    return {
      success: false,
      status: 500,
      error: error.message
    };
  }
}

// LINE WORKS認証
async function getAccessToken() {
  const clientId = process.env.LINEWORKS_CLIENT_ID;
  const clientSecret = process.env.LINEWORKS_CLIENT_SECRET;
  const serviceAccount = process.env.LINEWORKS_SERVICE_ACCOUNT_ID;
  const privateKey = process.env.LINEWORKS_PRIVATE_KEY;

  if (!clientId || !clientSecret || !serviceAccount || !privateKey) {
    throw new Error('認証情報が設定されていません');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientId,
    sub: serviceAccount,
    iat: now,
    exp: now + 3600
  };

  const assertion = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

  const response = await fetch('https://auth.worksmobile.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'calendar,user.read,bot',
      assertion: assertion
    })
  });

  const responseData = await response.json();
  return response.status === 200 ? responseData.access_token : null;
}
