// api/lineworks-test.js
// LINE WORKS API接続テスト

import jwt from 'jsonwebtoken';
import axios from 'axios';

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
    const clientId = process.env.LINEWORKS_CLIENT_ID;
    const clientSecret = process.env.LINEWORKS_CLIENT_SECRET;
    const serviceAccountId = process.env.LINEWORKS_SERVICE_ACCOUNT_ID;
    const privateKey = process.env.LINEWORKS_PRIVATE_KEY;

    if (!clientId || !clientSecret || !serviceAccountId || !privateKey) {
      return res.status(400).json({
        success: false,
        error: '認証情報が不足しています'
      });
    }

    // JWTトークンを作成
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientId,
      sub: serviceAccountId,
      iat: now,
      exp: now + 3600,
      aud: 'https://www.worksapis.com/v1.0/oauth2/token'
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // アクセストークンを取得
    const tokenResponse = await axios.post('https://www.worksapis.com/v1.0/oauth2/token', 
      `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(token)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // カレンダー一覧を取得
    const calendarsResponse = await axios.get('https://www.worksapis.com/v1.0/calendars', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      message: "LINE WORKS API接続成功",
      accessToken: accessToken ? '取得済み' : '未取得',
      calendars: calendarsResponse.data,
      date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('LINE WORKS API接続エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || '詳細情報なし',
      status: error.response?.status,
      date: new Date().toISOString()
    });
  }
}
