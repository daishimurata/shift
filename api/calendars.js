// api/calendars.js
// LINE WORKSカレンダー一覧を取得するAPI

import { getLineWorksToken } from './lineworks-auth.js';
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
    // LINE WORKS認証情報が設定されている場合
    if (process.env.LINEWORKS_CLIENT_ID && process.env.LINEWORKS_CLIENT_SECRET) {
      try {
        // LINE WORKS認証
        const accessToken = await getLineWorksToken();
        
        // カレンダー一覧を取得
        const response = await axios.get(
          'https://www.worksapis.com/v1.0/calendars',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const calendars = response.data;
        
        res.status(200).json({
          success: true,
          message: "LINE WORKSから取得したカレンダー一覧です",
          calendars: calendars,
          date: new Date().toISOString()
        });
        
      } catch (lineworksError) {
        console.error('LINE WORKS接続エラー:', lineworksError.message);
        res.status(500).json({
          success: false,
          error: `LINE WORKS接続エラー: ${lineworksError.message}`,
          message: "カレンダー一覧の取得に失敗しました"
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: "LINE WORKS認証情報が未設定です",
        message: "環境変数を設定してください"
      });
    }
    
  } catch (error) {
    console.error('API エラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
