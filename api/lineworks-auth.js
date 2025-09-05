// api/lineworks-auth.js
// LINE WORKS認証機能

import jwt from 'jsonwebtoken';
import axios from 'axios';

// LINE WORKS認証トークンを取得
export async function getLineWorksToken() {
  try {
    const clientId = process.env.LINEWORKS_CLIENT_ID;
    const clientSecret = process.env.LINEWORKS_CLIENT_SECRET;
    const serviceAccountId = process.env.LINEWORKS_SERVICE_ACCOUNT_ID;
    const privateKey = process.env.LINEWORKS_PRIVATE_KEY;

    if (!clientId || !clientSecret || !serviceAccountId || !privateKey) {
      throw new Error('LINE WORKS認証情報が設定されていません');
    }

    // JWTトークンを作成
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientId,
      sub: serviceAccountId,
      iat: now,
      exp: now + 3600, // 1時間有効
      aud: 'https://www.worksapis.com/v1.0/oauth2/token'
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // アクセストークンを取得
    const response = await axios.post('https://www.worksapis.com/v1.0/oauth2/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: clientId,
        password: clientSecret
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('LINE WORKS認証エラー:', error.message);
    throw error;
  }
}

// LINE WORKSカレンダーイベントを取得
export async function getLineWorksCalendarEvents(accessToken, calendarId, startDate, endDate) {
  try {
    const response = await axios.get(
      `https://www.worksapis.com/v1.0/calendars/${calendarId}/events`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          start: startDate,
          end: endDate
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('LINE WORKSカレンダー取得エラー:', error.message);
    throw error;
  }
}

// LINE WORKSユーザー情報を取得
export async function getLineWorksUsers(accessToken) {
  try {
    const response = await axios.get(
      'https://www.worksapis.com/v1.0/users',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('LINE WORKSユーザー取得エラー:', error.message);
    throw error;
  }
}
