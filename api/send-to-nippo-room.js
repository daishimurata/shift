// api/send-to-nippo-room.js
// 「日报」トークルーム専用メッセージ送信API

import jwt from 'jsonwebtoken';

// LINE WORKS認証（動作確認済み）
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

// チャンネルにメッセージ送信
async function sendChannelMessage(accessToken, channelId, message) {
  try {
    console.log('チャンネル送信開始:', { channelId, messageLength: message.length });
    
    const response = await fetch(`https://www.worksapis.com/v1.0/bots/10746138/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          type: 'text',
          text: message
        }
      })
    });

    const result = await response.json();
    console.log('チャンネル送信結果:', { status: response.status, result });
    
    return {
      success: response.ok,
      data: result,
      status: response.status
    };
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 「日报」トークルーム設定
    const nippoRoomInfo = {
      channelId: '2ddfe141-b9d5-6c2a-8027-43e009a916bc',
      name: '日报',
      description: 'おひさま農園日報トークルーム'
    };

    // カスタムメッセージ取得
    const customMessage = req.query.message || req.body?.message;
    
    // 全員メンション付きデフォルトメッセージ
    const defaultMessage = `@All こちらにメッセージをお願いします

おひさま農園の皆さん、お疲れさまです！

Bot「日向」からのお知らせです。
こちらの「日报」トークルームで日報や連絡事項を
共有していただけますようお願いいたします。

🌻 よろしくお願いします！`;

    const messageText = customMessage || defaultMessage;

    // LINE WORKS認証
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('LINE WORKS認証に失敗しました');
    }

    // 「日报」トークルームにメッセージ送信
    const result = await sendChannelMessage(accessToken, nippoRoomInfo.channelId, messageText);
    
    return res.status(200).json({
      success: result.success,
      message: result.success ? 
        '「日报」トークルームにメッセージを送信しました' : 
        'メッセージ送信に失敗しました',
      channelInfo: {
        channelId: nippoRoomInfo.channelId,
        name: nippoRoomInfo.name,
        description: nippoRoomInfo.description
      },
      messageContent: messageText,
      result: result.data,
      timestamp: new Date().toISOString(),
      bot: {
        name: '日向',
        id: '10746138'
      }
    });

  } catch (error) {
    console.error('API処理エラー:', error);
    
    return res.status(500).json({
      success: false,
      message: 'メッセージ送信処理中にエラーが発生しました',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
