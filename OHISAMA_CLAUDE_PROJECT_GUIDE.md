# おひさま農園 LINE WORKS API システム - Claude プロジェクト知識ベース

## 🎯 **システム概要**
おひさま農園のLINE WORKS連携システム。Bot「日向」を通じて以下の機能を提供：
1. **スタッフ全員への個別メッセージ送信**
2. **カレンダー予定取得**
3. **「日报」チャット情報のリアルタイム取得**

---

## 🚨 **重要: Vercel MCP必須事項**

### **LINE WORKSチャット情報取得時の注意**
```
⚠️ 絶対に覚えておくこと ⚠️

LINE WORKSの「日报」チャットの最新ログを取得する際は、
必ずVercel MCPツールを使用してください。

❌ 通常のweb_fetch: キャッシュ問題で古いデータしか取得できない
✅ Vercel MCP: リアルタイムで最新データを確実に取得

使用方法:
Vercel:web_fetch_vercel_url({
  url: "https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh"
})
```

---

## 📱 **1. スタッフ個別メッセージ送信API**

### **基本URL構造**
```
https://shift-lineworks-[デプロイメントID]-daishimuratas-projects.vercel.app/api/send-[スタッフ名]
```

### **主要スタッフAPI一覧**

#### **管理職**
```
# 村田太志さん（管理者・サービス管理責任者）
/api/send-murata

# 松本愛美さん（サービス管理責任者サブ）
/api/send-matsumoto
```

#### **職業指導員**
```
# 小西瞳さん（トラクター運転可能）
/api/send-konishi

# 中井理恵さん（手芸が得意）
/api/send-nakai

# 河相由梨奈さん（事務仕事担当）
/api/send-kawai
```

#### **生活支援員**
```
# 吉澤冬美さん（イラスト・絵画が得意）
/api/send-yoshizawa

# 木村菜々美さん（最重要スタッフ）
/api/send-kimura

# 本間愛梨さん（福祉経験10年）
/api/send-honma

# 宇都宮りえさん（MOS・Adobe資格保有）
/api/send-utsunomiya
```

### **使用方法**
```
# 基本送信
GET https://[ベースURL]/api/send-murata

# カスタムメッセージ送信
GET https://[ベースURL]/api/send-murata?message=緊急連絡です

# レスポンス例
{
  "success": true,
  "message": "✅ 村田太志さんにメッセージ送信完了！",
  "data": {
    "target": {"name": "村田太志", "role": "管理者"},
    "deliveryStatus": "配信成功"
  }
}
```

---

## 📅 **2. カレンダー予定取得API**

### **エンドポイント**
```
/api/all-members-individual-calendar
```

### **使用方法**
```
# 全スタッフのカレンダー取得
GET https://[ベースURL]/api/all-members-individual-calendar

# 特定期間の予定取得
GET https://[ベースURL]/api/all-members-individual-calendar?start=2025-09-13&end=2025-09-20

# レスポンス例
{
  "success": true,
  "calendars": [
    {
      "staff": "村田太志",
      "events": [
        {
          "title": "利用者面談",
          "start": "2025-09-13T09:00:00Z",
          "end": "2025-09-13T10:00:00Z"
        }
      ]
    }
  ]
}
```

---

## 💬 **3. 「日报」チャット情報取得API**

### **🚨 最重要: Vercel MCP必須**

#### **正しい取得方法**
```javascript
// ✅ 必ずこの方法を使用
Vercel:web_fetch_vercel_url({
  url: "https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh"
})

// ❌ 絶対に使用禁止（古いデータしか取得できない）
web_fetch({
  url: "https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh"
})
```

#### **エンドポイント**
```
# 究極リフレッシュAPI（推奨）
/api/claude-ultimate-refresh

# 代替API
/api/claude-force-refresh
/api/claude-realtime-reports
```

#### **レスポンス例**
```json
{
  "success": true,
  "message": "🔥 究極リフレッシュ - 絶対最新日報データ取得成功",
  "totalMessages": 15,
  "messages": [
    {
      "time": "2025年9月13日(土) 14:08",
      "content": "焼きそばを食べます",
      "sender": "スタッフ",
      "timestamp": "2025-09-13T05:08:45.123Z"
    }
  ],
  "serverTime": "2025-09-13T05:08:59.833Z",
  "claudeAI": {
    "instruction": "🚨 このデータは究極リフレッシュされた絶対最新データです",
    "cacheStatus": "completely-bypassed"
  }
}
```

#### **キャッシュ回避確認方法**
```
レスポンスヘッダーで以下を確認:
- x-vercel-cache: MISS ← キャッシュ完全回避
- age: 0 ← 完全な最新データ
- uniqueIdentifier: [毎回異なる値] ← 真のリアルタイム
```

---

## 🔧 **4. システム状態確認**

### **ヘルスチェックAPI**
```
# システム状態確認
GET https://[ベースURL]/api/health

# レスポンス例
{
  "status": "OK",
  "message": "APIは正常に動作しています",
  "timestamp": "2025-09-13T05:10:00.000Z"
}
```

---

## 📊 **5. 現在の最新デプロイメントURL**

### **主要API（2025年9月13日時点）**
```
# 日報取得（Vercel MCP必須）
https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh

# スタッフメッセージ送信（最新）
https://shift-lineworks-2u628r0cg-daishimuratas-projects.vercel.app/api/send-murata

# カレンダー取得
https://shift-lineworks-[最新ID]-daishimuratas-projects.vercel.app/api/all-members-individual-calendar

# システム状態確認
https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/health
```

---

## 🎯 **6. 使用例とベストプラクティス**

### **日報監視の実装例**
```javascript
// 1. Vercel MCPで最新データ取得
const reportData = await Vercel:web_fetch_vercel_url({
  url: "https://shift-lineworks-c92ewi08e-daishimuratas-projects.vercel.app/api/claude-ultimate-refresh"
});

// 2. データ分析
const latestMessages = reportData.messages.slice(0, 5);
const urgentItems = latestMessages.filter(msg => 
  msg.content.includes('緊急') || msg.content.includes('至急')
);

// 3. 必要に応じてスタッフに連絡
if (urgentItems.length > 0) {
  // 管理者に緊急連絡
  await web_fetch({
    url: 'https://shift-lineworks-2u628r0cg-daishimuratas-projects.vercel.app/api/send-murata?message=緊急事項を確認してください'
  });
}
```

### **定期監視の推奨頻度**
```
- 通常時: 1時間毎
- 重要時期: 30分毎  
- 緊急時: 10分毎
```

---

## ⚠️ **重要な注意事項**

### **1. Vercel MCP の絶対使用**
```
LINE WORKSチャット取得時は必ずVercel MCPを使用。
通常のweb_fetchは古いキャッシュデータしか返さない。
```

### **2. デプロイメントURL の更新**
```
Vercelの新しいデプロイメント時はURLが変更される。
エラーが発生した場合は最新URLを確認。
```

### **3. レート制限**
```
API呼び出しは適切な間隔で実行。
連続呼び出しは避ける。
```

---

## 🚀 **システム構成図**

```
LINE WORKS「日报」トークルーム
    ↓ (リアルタイムWebhook)
Redis データベース (Upstash)
    ↓ (API)
Vercel プラットフォーム
    ↓ (Vercel MCP)
Claude AI (完全自動監視)
```

---

## 📞 **トラブルシューティング**

### **よくある問題と解決策**

#### **1. 古いデータしか取得できない**
```
原因: 通常のweb_fetchを使用している
解決: Vercel MCPツールに変更
```

#### **2. APIエラー (404/500)**
```
原因: 古いデプロイメントURLを使用
解決: 最新のVercel URLを確認
```

#### **3. メッセージ送信失敗**
```
原因: LINE WORKS認証エラー
解決: システム管理者に連絡
```

---

## 📋 **スタッフ一覧（参考）**

### **管理職**
- 村田太志（サービス管理責任者）
- 松本愛美（サービス管理責任者サブ）

### **職業指導員**
- 小西瞳（トラクター運転可能）
- 中井理恵（手芸が得意）
- 河相由梨奈（事務仕事担当）

### **生活支援員**
- 吉澤冬美（イラスト・絵画が得意）
- 木村菜々美（最重要スタッフ）
- 本間愛梨（福祉経験10年）
- 宇都宮りえ（MOS・Adobe資格保有）

---

**最終更新**: 2025年9月13日 14:20
**システム状態**: 🟢 完全稼働中
**重要事項**: Vercel MCP必須使用
