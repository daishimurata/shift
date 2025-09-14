// api/claude-force-refresh.js
// Claude AI専用 - 強制リフレッシュ日報API（最強キャッシュ回避版）

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
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 15);
  
  // 最強のキャッシュ回避設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // 複数のキャッシュ回避ヘッダー
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '-1');
  res.setHeader('Last-Modified', new Date().toUTCString());
  res.setHeader('ETag', `"force-refresh-${timestamp}-${randomId}"`);
  res.setHeader('Vary', 'Accept-Encoding, User-Agent, Authorization');
  res.setHeader('X-Timestamp', timestamp.toString());
  res.setHeader('X-Random-ID', randomId);
  res.setHeader('X-Force-Refresh', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'GET method only',
      timestamp: timestamp,
      randomId: randomId
    });
  }

  try {
    const redisClient = await getRedisClient();
    const currentTime = new Date().toISOString();
    
    // 「日报」トークルームのメッセージを取得
    const messages = await redisClient.lRange('ohisama:messages', 0, 49);
    
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        return null;
      }
    }).filter(msg => msg && msg.isFromReportRoom);

    // Claude AI用にシンプルな形式で返す（強制リフレッシュ版）
    const simplifiedMessages = parsedMessages.map((msg, index) => ({
      id: `force_${index}_${timestamp}_${randomId}`, // 完全にユニークなID
      time: msg.formattedTime || '時刻不明',
      content: msg.content?.text || '',
      sender: msg.sender?.displayName || 'スタッフ',
      timestamp: msg.createdTime,
      received: msg.webhookReceived,
      messageIndex: index
    }));

    // 強制リフレッシュレスポンス
    const response = {
      success: true,
      message: '強制リフレッシュ - 最新日報データ取得成功',
      reportRoom: '日报',
      totalMessages: simplifiedMessages.length,
      messages: simplifiedMessages,
      serverTime: currentTime,
      lastUpdated: currentTime,
      requestId: `force_refresh_${timestamp}_${randomId}`,
      apiVersion: 'claude-force-refresh-v1',
      cacheControl: 'force-no-cache',
      dataFreshness: 'force-real-time',
      refreshTimestamp: timestamp,
      uniqueIdentifier: randomId,
      forceRefresh: true,
      // Claude AI用の追加情報
      claudeAI: {
        instruction: 'このデータは強制リフレッシュされた最新データです',
        cacheStatus: 'bypassed',
        dataGuarantee: 'real-time-guaranteed'
      }
    };

    // JSONレスポンスを返す前にログ出力
    console.log('強制リフレッシュAPI呼び出し:', {
      timestamp: timestamp,
      randomId: randomId,
      messageCount: simplifiedMessages.length,
      latestMessage: simplifiedMessages[0]?.content?.substring(0, 50)
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('Claude Force Refresh API エラー:', error);
    res.status(500).json({
      success: false,
      error: '強制リフレッシュデータ取得に失敗しました',
      message: error.message,
      timestamp: timestamp,
      randomId: randomId,
      requestId: `force_error_${timestamp}`
    });
  }
}
