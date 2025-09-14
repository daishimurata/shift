// api/read-stored-messages-redis-v2.js
// Redis蓄積メッセージ読み取りAPI - 標準redisクライアント版

import { createClient } from 'redis';

let redis = null;

// Redis接続を取得（シングルトンパターン）
async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.log('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

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
    // パラメータ取得
    const {
      days = '7',
      staff = '',
      keyword = '',
      limit = '50'
    } = req.query;

    // Redis蓄積メッセージを読み取り
    const messages = await readMessagesFromRedis({
      days: parseInt(days),
      staff: staff,
      keyword: keyword,
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      message: `「日报」トークルーム Redis蓄積メッセージ読み取り完了 (v2)`,
      data: {
        channelInfo: {
          channelId: '2ddfe141-b9d5-6c2a-8027-43e009a916bc',
          channelName: '日报',
          botName: '日向',
          dataSource: 'Redis (標準クライアント)'
        },
        filters: {
          days: parseInt(days),
          staff: staff || 'すべて',
          keyword: keyword || 'なし',
          limit: parseInt(limit)
        },
        messages: messages.filteredMessages,
        totalMessages: messages.totalCount,
        statistics: messages.statistics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Redis蓄積メッセージ読み取りエラー:', error);
    res.status(500).json({
      success: false,
      message: 'Redis蓄積メッセージの読み取りに失敗しました (v2)',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Redisからメッセージを読み取り
async function readMessagesFromRedis(filters) {
  try {
    const redisClient = await getRedisClient();
    
    // 全メッセージを取得
    const rawMessages = await redisClient.lRange('ohisama:messages', 0, filters.limit - 1);
    
    // JSON解析
    const allMessages = rawMessages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        console.error('メッセージ解析エラー:', error);
        return null;
      }
    }).filter(msg => msg !== null);

    // 日付範囲計算
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - filters.days);

    // メッセージフィルタリング
    const filteredMessages = allMessages
      .filter(message => {
        // 日付フィルタ
        if (message.createdTime) {
          const messageDate = new Date(message.createdTime);
          if (messageDate < startDate || messageDate > endDate) {
            return false;
          }
        }

        // スタッフフィルタ
        if (filters.staff && message.sender && message.sender.displayName) {
          if (!message.sender.displayName.includes(filters.staff)) {
            return false;
          }
        }

        // キーワードフィルタ
        if (filters.keyword && message.content && message.content.text) {
          if (!message.content.text.includes(filters.keyword)) {
            return false;
          }
        }

        return true;
      })
      .slice(0, filters.limit)
      .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime)); // 新しい順

    // 統計情報取得
    const statistics = await getStatistics();

    return {
      filteredMessages: filteredMessages,
      totalCount: filteredMessages.length,
      statistics: statistics
    };

  } catch (error) {
    console.error('Redis読み取りエラー:', error);
    throw error;
  }
}

// 統計情報取得
async function getStatistics() {
  try {
    const redisClient = await getRedisClient();
    
    const totalMessages = await redisClient.get('ohisama:stats:total_messages') || '0';
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = await redisClient.get(`ohisama:stats:daily:${today}`) || '0';

    return {
      totalMessages: parseInt(totalMessages),
      todayMessages: parseInt(todayMessages),
      redisConnection: 'OK'
    };
  } catch (error) {
    return {
      totalMessages: 0,
      todayMessages: 0,
      redisConnection: 'ERROR',
      error: error.message
    };
  }
}
