// api/claude-ultimate-refresh.js
// Claude AI専用 - 究極キャッシュ回避日報API

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
  const randomId = Math.random().toString(36).substr(2, 20);
  const uniqueHash = Buffer.from(`${timestamp}-${randomId}`).toString('base64');
  
  // 究極のキャッシュ回避設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  // 複数のキャッシュ回避ヘッダー（最強版）
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Last-Modified', new Date(0).toUTCString());
  res.setHeader('ETag', `"ultimate-${timestamp}-${randomId}"`);
  res.setHeader('Vary', '*');
  res.setHeader('X-Timestamp', timestamp.toString());
  res.setHeader('X-Random-ID', randomId);
  res.setHeader('X-Unique-Hash', uniqueHash);
  res.setHeader('X-Ultimate-Refresh', 'true');
  res.setHeader('X-Claude-AI-Cache-Buster', `${timestamp}-${randomId}`);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'GET method only',
      timestamp: timestamp,
      randomId: randomId,
      uniqueHash: uniqueHash
    });
  }

  try {
    const redisClient = await getRedisClient();
    const currentTime = new Date();
    const jstTime = new Date(currentTime.getTime() + (9 * 60 * 60 * 1000)); // JST変換
    
    // 「日报」トークルームのメッセージを取得
    const messages = await redisClient.lRange('ohisama:messages', 0, 49);
    
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        return null;
      }
    }).filter(msg => msg && msg.isFromReportRoom);

    // Claude AI用にシンプルな形式で返す（究極版）
    const simplifiedMessages = parsedMessages.map((msg, index) => ({
      id: `ultimate_${index}_${timestamp}_${randomId}`, // 完全にユニークなID
      time: msg.formattedTime || '時刻不明',
      content: msg.content?.text || '',
      sender: msg.sender?.displayName || 'スタッフ',
      timestamp: msg.createdTime,
      received: msg.webhookReceived,
      messageIndex: index,
      uniqueId: `msg_${timestamp}_${index}_${randomId}`
    }));

    // 究極リフレッシュレスポンス
    const response = {
      success: true,
      message: '🔥 究極リフレッシュ - 絶対最新日報データ取得成功',
      reportRoom: '日报',
      totalMessages: simplifiedMessages.length,
      messages: simplifiedMessages,
      serverTime: currentTime.toISOString(),
      jstTime: jstTime.toISOString(),
      lastUpdated: currentTime.toISOString(),
      requestId: `ultimate_refresh_${timestamp}_${randomId}`,
      apiVersion: 'claude-ultimate-refresh-v1',
      cacheControl: 'ultimate-no-cache',
      dataFreshness: 'ultimate-real-time',
      refreshTimestamp: timestamp,
      uniqueIdentifier: randomId,
      uniqueHash: uniqueHash,
      ultimateRefresh: true,
      // Claude AI用の強化情報
      claudeAI: {
        instruction: '🚨 このデータは究極リフレッシュされた絶対最新データです',
        cacheStatus: 'completely-bypassed',
        dataGuarantee: 'ultimate-real-time-guaranteed',
        timestamp: timestamp,
        uniqueHash: uniqueHash,
        forceUpdate: true
      },
      // 追加のキャッシュ回避情報
      cacheBuster: {
        timestamp: timestamp,
        randomId: randomId,
        uniqueHash: uniqueHash,
        method: 'ultimate-refresh'
      }
    };

    // JSONレスポンスを返す前にログ出力
    console.log('究極リフレッシュAPI呼び出し:', {
      timestamp: timestamp,
      randomId: randomId,
      uniqueHash: uniqueHash,
      messageCount: simplifiedMessages.length,
      latestMessage: simplifiedMessages[0]?.content?.substring(0, 50),
      jstTime: jstTime.toISOString()
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('Claude Ultimate Refresh API エラー:', error);
    res.status(500).json({
      success: false,
      error: '究極リフレッシュデータ取得に失敗しました',
      message: error.message,
      timestamp: timestamp,
      randomId: randomId,
      uniqueHash: uniqueHash,
      requestId: `ultimate_error_${timestamp}`
    });
  }
}
