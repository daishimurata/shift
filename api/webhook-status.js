// api/webhook-status.js
// Webhook受信状況確認API

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
    // 現在時刻
    const now = new Date();
    const jstTime = now.toLocaleString('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short'
    });

    res.status(200).json({
      success: true,
      message: 'Webhook状況確認API',
      data: {
        currentTime: {
          iso: now.toISOString(),
          jst: jstTime
        },
        webhookEndpoint: 'https://shift-lineworks-hbdotq9yr-daishimuratas-projects.vercel.app/api/lineworks-callback',
        channelId: '2ddfe141-b9d5-6c2a-8027-43e009a916bc',
        botInfo: {
          name: '日向',
          id: '10746138'
        },
        instructions: {
          step1: 'LINE WORKSの「日报」トークルームでメッセージを投稿',
          step2: 'Bot「日向」がトークルームに参加していることを確認',
          step3: 'メッセージ投稿後、このAPIを再実行して時刻を比較',
          step4: 'Webhook受信があれば、Vercelログに記録される'
        },
        troubleshooting: {
          issue1: 'Bot「日向」がトークルームに参加していない → 手動で招待',
          issue2: 'Callback URLが古い → Developer Consoleで最新URLに更新',
          issue3: 'Webhookイベントが無効 → callbackEventsの設定確認'
        }
      },
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Webhook状況確認エラー:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook状況確認に失敗しました',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
