// api/claude-realtime-reports.js
// Claude AI専用 - リアルタイム日報読み取りAPI（キャッシュ回避版）

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
  // 強力なキャッシュ回避設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Last-Modified', new Date().toUTCString());
  res.setHeader('ETag', `"${Date.now()}-${Math.random()}"`);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET method only' });
  }

  try {
    const redisClient = await getRedisClient();
    const currentTime = new Date().toISOString();
    
    // 「日报」トークルームのメッセージを取得
    const messages = await redisClient.lRange('ohisama:messages', 0, 49); // 最新50件
    
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        return null;
      }
    }).filter(msg => msg && msg.isFromReportRoom);

    // Claude AI用にシンプルな形式で返す（タイムスタンプ付き）
    const simplifiedMessages = parsedMessages.map((msg, index) => ({
      id: `msg_${index}_${Date.now()}`, // ユニークID
      time: msg.formattedTime || '時刻不明',
      content: msg.content?.text || '',
      sender: msg.sender?.displayName || 'スタッフ',
      timestamp: msg.createdTime,
      received: msg.webhookReceived
    }));

    // 成功レスポンス（キャッシュ回避用の追加情報）
    res.status(200).json({
      success: true,
      message: 'リアルタイム日報データ取得成功',
      reportRoom: '日报',
      totalMessages: simplifiedMessages.length,
      messages: simplifiedMessages,
      serverTime: currentTime,
      lastUpdated: currentTime,
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      apiVersion: 'claude-realtime-v1',
      cacheControl: 'no-cache',
      dataFreshness: 'real-time'
    });

  } catch (error) {
    console.error('Claude Realtime API エラー:', error);
    res.status(500).json({
      success: false,
      error: 'リアルタイムデータ取得に失敗しました',
      message: error.message,
      timestamp: new Date().toISOString(),
      requestId: `err_${Date.now()}`
    });
  }
}
