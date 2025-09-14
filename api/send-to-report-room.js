// api/send-to-report-room.js
// 「日报」トークルームにメッセージ送信API

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
    // 「日报」トークルーム情報
    const reportRoomInfo = {
      channelId: '2ddfe141-b9d5-6c2a-8027-43e009a916bc',
      channelName: '日报',
      description: 'おひさま農園日報トークルーム'
    };

    // カスタムメッセージ取得（オプション）
    const customMessage = req.query.message || req.body?.message;
    
    const defaultMessage = `🤖 Bot「日向」からのテストメッセージ

システム動作確認中です。

📋 Webhook受信テスト実行中
🔄 メッセージ送受信機能確認  
⚡ リアルタイム日報システム稼働中

このメッセージが「日报」トークルームに表示され、
Webhookで受信されていれば、システムは正常に動作しています。

日向より 🌻
${new Date().toLocaleString('ja-JP', { 
  timeZone: 'Asia/Tokyo', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}`;

    const messageText = customMessage || defaultMessage;

    // LINE WORKS認証
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('LINE WORKS認証に失敗しました');
    }

    // 「日报」トークルームにメッセージ送信
    const result = await sendToReportRoom(accessToken, reportRoomInfo.channelId, messageText);
    
    res.status(200).json({
      success: true,
      message: '✅ 「日报」トークルームにメッセージ送信完了！',
      data: {
        target: reportRoomInfo,
        messageType: customMessage ? 'カスタムメッセージ' : 'デフォルトテストメッセージ',
        deliveryStatus: result.success ? '配信成功' : '配信失敗',
        status: result.status,
        botName: '日向',
        apiType: 'トークルーム送信API',
        apiResponse: result.apiResponse
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('トークルーム送信エラー:', error);
    res.status(500).json({
      success: false,
      message: '「日报」トークルームへのメッセージ送信に失敗しました',
      error: error.message,
      target: '日报トークルーム',
      apiType: 'トークルーム送信API',
      timestamp: new Date().toISOString()
    });
  }
}

// 「日报」トークルームにメッセージ送信
async function sendToReportRoom(accessToken, channelId, message) {
  try {
    const messageContent = {
      content: {
        type: 'text',
        text: message
      }
    };

    const response = await fetch(`https://www.worksapis.com/v1.0/bots/10746138/channels/${channelId}/messages`, {
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

// LINE WORKS認証（既存システム流用）
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
      scope: 'bot,bot.message,user.read,directory.read',
      assertion: assertion
    })
  });

  const responseData = await response.json();
  return response.status === 200 ? responseData.access_token : null;
}
