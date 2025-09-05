// api/file-auth.js
// ファイルからPrivate Keyを読み込む認証API

import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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

    if (!clientId || !clientSecret || !serviceAccountId) {
      return res.status(400).json({
        success: false,
        error: '認証情報が不足しています'
      });
    }

    // Private Keyを環境変数から取得
    let privateKey = process.env.LINEWORKS_PRIVATE_KEY;
    
    // 環境変数にPrivate Keyがない場合は、ファイルから読み込み
    if (!privateKey) {
      try {
        const keyPath = path.join(process.cwd(), 'private_key.pem');
        privateKey = fs.readFileSync(keyPath, 'utf8');
      } catch (fileError) {
        return res.status(400).json({
          success: false,
          error: 'Private Keyが見つかりません'
        });
      }
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

    res.status(200).json({
      success: true,
      message: "LINE WORKS認証成功",
      accessToken: accessToken ? '取得済み' : '未取得',
      tokenType: tokenResponse.data.token_type,
      expiresIn: tokenResponse.data.expires_in,
      date: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('LINE WORKS認証エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || '詳細情報なし',
      status: error.response?.status,
      date: new Date().toISOString()
    });
  }
}
