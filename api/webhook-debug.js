// api/webhook-debug.js
// Webhook受信デバッグ用API

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
    const redisClient = await getRedisClient();
    
    // 最新のWebhook受信ログを取得
    const webhookLogs = await redisClient.lRange('ohisama:webhook:logs', 0, 9); // 最新10件
    
    // 最新のメッセージを取得
    const messages = await redisClient.lRange('ohisama:messages', 0, 4); // 最新5件
    
    const parsedMessages = messages.map(msg => {
      try {
        return JSON.parse(msg);
      } catch (error) {
        return null;
      }
    }).filter(msg => msg);

    // Redis統計情報
    const totalMessages = await redisClient.lLen('ohisama:messages');
    const totalLogs = await redisClient.lLen('ohisama:webhook:logs');

    // 現在のWebhook設定確認
    const currentTime = new Date().toISOString();
    
    res.status(200).json({
      success: true,
      message: 'Webhook受信状況デバッグ情報',
      debugInfo: {
        currentTime: currentTime,
        webhookEndpoint: 'https://shift-lineworks-ii49wv9z9-daishimuratas-projects.vercel.app/api/lineworks-callback-redis-v2',
        expectedChannelId: '2ddfe141-b9d5-6c2a-8027-43e009a916bc',
        botId: '10746138'
      },
      statistics: {
        totalMessages: totalMessages,
        totalWebhookLogs: totalLogs,
        redisConnection: 'OK'
      },
      latestMessages: parsedMessages.map(msg => ({
        messageId: msg.messageId,
        time: msg.formattedTime,
        content: msg.content?.text?.substring(0, 50) + '...',
        sender: msg.sender?.displayName,
        webhookReceived: msg.webhookReceived,
        isFromReportRoom: msg.isFromReportRoom
      })),
      webhookLogs: webhookLogs.map(log => {
        try {
          return JSON.parse(log);
        } catch (error) {
          return { raw: log };
        }
      }),
      troubleshooting: {
        step1: 'LINE WORKSで「日报」トークルームにメッセージを送信',
        step2: 'このAPIを再度呼び出してWebhook受信を確認',
        step3: 'latestMessagesに新しいメッセージが表示されるかチェック',
        step4: 'webhookLogsでエラーがないかチェック'
      },
      timestamp: currentTime
    });

  } catch (error) {
    console.error('Webhook Debug API エラー:', error);
    res.status(500).json({
      success: false,
      error: 'デバッグ情報取得に失敗しました',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
