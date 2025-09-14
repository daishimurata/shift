// api/lineworks-callback-redis-v2.js
// LINE WORKS Webhook受信API - 公式仕様準拠版

import { createClient } from 'redis';
import crypto from 'crypto';

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

// 日本時間フォーマット
function formatJapaneseTime(isoString) {
  if (!isoString) return '時刻不明';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    });
  } catch (error) {
    return '時刻不明';
  }
}

// 署名検証関数（LINE WORKS公式仕様）
function verifySignature(signature, body, botSecret) {
  try {
    const hash = crypto.createHmac('sha256', botSecret).update(body, 'utf8').digest();
    const expectedSignature = hash.toString('base64');
    return signature === expectedSignature;
  } catch (error) {
    console.error('署名検証エラー:', error);
    return false;
  }
}

// 勤務時間判定
function isWorkingHours(isoString) {
  if (!isoString) return false;
  
  try {
    const date = new Date(isoString);
    const hour = date.getHours();
    const day = date.getDay(); // 0=日曜, 6=土曜
    
    // 平日 9:00-17:00 を勤務時間とする
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  } catch (error) {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const signature = req.headers['x-works-signature'];
    const botId = req.headers['x-works-botid'];
    const botSecret = process.env.LINEWORKS_BOT_SECRET || 'i4AxB7JBLsgBe2GbhZk9ZSUDfxGKbF';

    console.log('Webhook受信 (公式仕様準拠):', {
      method: req.method,
      hasSignature: !!signature,
      botId: botId,
      timestamp: new Date().toISOString()
    });

    // POSTリクエストのみ処理
    if (req.method !== 'POST') {
      console.log('非POSTリクエスト:', req.method);
      return res.status(200).end(); // LINE WORKS仕様: 常に200を返す
    }

    const webhookData = req.body;

    // 署名検証（本番環境では必須）
    if (signature && botSecret) {
      const rawBody = JSON.stringify(webhookData);
      const isValidSignature = verifySignature(signature, rawBody, botSecret);
      console.log('署名検証結果:', isValidSignature);
      
      if (!isValidSignature) {
        console.log('署名検証失敗 - しかし処理を継続（開発中）');
        // 本番では: return res.status(200).end();
      }
    }

    // LINE WORKS Webhookデータの検証（公式仕様準拠）
    if (!webhookData || !webhookData.source || !webhookData.content) {
      console.log('無効なWebhookデータ構造:', webhookData);
      return res.status(200).end(); // LINE WORKS仕様: エラーでも200を返す
    }

    // メッセージデータの抽出・整形（🔥 公式仕様準拠）
    const messageData = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId: webhookData.source?.channelId || 'unknown', // 🔥 重要な修正
      createdTime: webhookData.issuedTime || new Date().toISOString(),
      sender: {
        userId: webhookData.source?.userId || 'unknown', // 🔥 重要な修正
        displayName: 'スタッフ', // 実際の表示名は別途取得が必要
        type: 'user',
        domainId: webhookData.source?.domainId
      },
      content: {
        type: webhookData.content.type || 'text',
        text: webhookData.content.text || '',
        originalData: webhookData.content
      },
      webhookReceived: new Date().toISOString(),
      isFromReportRoom: (webhookData.source?.channelId === '2ddfe141-b9d5-6c2a-8027-43e009a916bc'), // 🔥 修正
      formattedTime: formatJapaneseTime(webhookData.issuedTime || new Date().toISOString()),
      isWorkHours: isWorkingHours(webhookData.issuedTime || new Date().toISOString()),
      rawWebhookData: webhookData // デバッグ用
    };

    // Webhookログを保存（デバッグ用）
    await saveWebhookLog({
      timestamp: new Date().toISOString(),
      channelId: messageData.channelId,
      isFromReportRoom: messageData.isFromReportRoom,
      senderType: messageData.sender.type,
      contentPreview: messageData.content.text?.substring(0, 50),
      webhookData: {
        hasSource: !!webhookData.source,
        hasContent: !!webhookData.content,
        sourceChannelId: webhookData.source?.channelId,
        contentType: webhookData.content?.type
      }
    });

    // 「日报」トークルームからのメッセージのみ保存
    if (messageData.isFromReportRoom && messageData.sender.type === 'user') {
      await saveMessageToRedis(messageData);
      
      console.log('日報メッセージ保存完了 (Redis v2):', {
        messageId: messageData.messageId,
        sender: messageData.sender.displayName,
        text: messageData.content.text?.substring(0, 50) + '...'
      });
    }

    // Webhook応答（LINE WORKS公式仕様: 常に200 OKを返す）
    res.status(200).end();
    
    // ログ出力（デバッグ用）
    console.log('Webhook処理完了:', {
      success: true,
      processed: messageData.isFromReportRoom,
      messageInfo: {
        channelId: messageData.channelId,
        sender: messageData.sender.displayName,
        isReportRoom: messageData.isFromReportRoom
      },
      realtimeData: messageData.isFromReportRoom ? {
        messageId: messageData.messageId,
        createdTime: messageData.createdTime,
        sender: messageData.sender,
        content: messageData.content,
        formattedTime: messageData.formattedTime,
        isWorkHours: messageData.isWorkHours
      } : null,
      storage: 'Redis (公式仕様準拠)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook処理エラー:', error);
    // LINE WORKS仕様: エラーが発生しても200を返す
    res.status(200).end();
  }
}

// メッセージをRedisに保存
async function saveMessageToRedis(messageData) {
  try {
    const redisClient = await getRedisClient();
    
    // メッセージリストに追加（最新が先頭）
    await redisClient.lPush('ohisama:messages', JSON.stringify(messageData));
    
    // 日付別インデックス作成
    const dateKey = messageData.createdTime.split('T')[0]; // YYYY-MM-DD
    await redisClient.lPush(`ohisama:messages:${dateKey}`, JSON.stringify(messageData));
    
    // 送信者別インデックス作成
    const senderKey = messageData.sender.displayName.replace(/\s+/g, '_');
    await redisClient.lPush(`ohisama:messages:sender:${senderKey}`, JSON.stringify(messageData));
    
    // 統計情報更新
    await redisClient.incr('ohisama:stats:total_messages');
    await redisClient.incr(`ohisama:stats:daily:${dateKey}`);
    
    // 最新100件のみ保持
    const totalMessages = await redisClient.lLen('ohisama:messages');
    if (totalMessages > 100) {
      await redisClient.lTrim('ohisama:messages', 0, 99);
    }

  console.log(`メッセージ保存完了 (Redis v2): ${messageData.messageId}`);
  return true;

} catch (error) {
  console.error('Redis保存エラー:', error);
  throw error;
}
}

// Webhookログ保存関数（デバッグ用）
async function saveWebhookLog(logData) {
  try {
    const redisClient = await getRedisClient();
    
    // Webhookログを保存
    await redisClient.lPush('ohisama:webhook:logs', JSON.stringify(logData));
    
    // 最新100件のみ保持
    const totalLogs = await redisClient.lLen('ohisama:webhook:logs');
    if (totalLogs > 100) {
      await redisClient.lTrim('ohisama:webhook:logs', 0, 99);
    }

    console.log('Webhookログ保存完了:', logData.timestamp);
    return true;

  } catch (error) {
    console.error('Webhookログ保存エラー:', error);
    return false;
  }
}
