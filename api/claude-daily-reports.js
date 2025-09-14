// api/claude-daily-reports.js
// Claude AI専用 - 日報読み取りAPI（シンプル版）

import { createClient } from 'redis';

let redis = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.log('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

export default async function handler(req, res) {
  // CORS設定（Claude AI対応）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET method only' });
  }

  try {
    const redisClient = await getRedisClient();
    
    // 「日报」トークルームのメッセージを取得
    const messages = await redisClient.lRange('ohisama:messages', 0, 49); // 最新50件
    
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        return null;
      }
    }).filter(msg => msg && msg.isFromReportRoom);

    // Claude AI用にシンプルな形式で返す
    const simplifiedMessages = parsedMessages.map(msg => ({
      time: msg.formattedTime || '時刻不明',
      content: msg.content?.text || '',
      sender: msg.sender?.displayName || 'スタッフ',
      timestamp: msg.createdTime
    }));

    // 成功レスポンス
    res.status(200).json({
      success: true,
      message: '日報データ取得成功',
      reportRoom: '日报',
      totalMessages: simplifiedMessages.length,
      messages: simplifiedMessages,
      lastUpdated: new Date().toISOString(),
      apiVersion: 'claude-optimized-v1'
    });

  } catch (error) {
    console.error('Claude API エラー:', error);
    res.status(500).json({
      success: false,
      error: 'データ取得に失敗しました',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
