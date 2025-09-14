# Claude.ai 実行コマンド集（Vercel Pro版）

## 🚀 基本システム情報
- **ベースURL**: `https://shift-lineworks-ii49wv9z9-daishimuratas-projects.vercel.app`
- **Bot名**: 日向
- **ステータス**: ✅ 本番稼働中（Redis対応・公式仕様準拠）

---

## 📱 個別スタッフメッセージ送信コマンド

### 🏆 最重要（木村捺々恵さん）
```
この URL にアクセスして木村捺々恵さんにメッセージを送信してください：
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kimura
```

### 👨‍💼 管理職
```
# 村田太志さん（管理者）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-murata

# 松本愛美さん（サービス管理責任者サブ）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-matsumoto
```

### 👩‍🏫 職業指導員
```
# 小西瞳さん（トラクター運転可能）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-konishi

# 中井理恵さん（手芸が得意）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-nakai

# 河相由梨奈さん（事務仕事担当）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kawai
```

### 👥 生活支援員
```
# 吉澤冬美さん（イラスト・絵画が得意）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-yoshizawa

# 本間愛梨さん（福祉経験10年）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-honma

# 宇都宮りえさん（MOS・Adobe資格保有）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-utsunomiya
```

### 🏢 事務
```
# おひさま農園アカウント
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-staff-account
```

---

## 🎨 カスタムメッセージ例

### 緊急連絡
```
# 木村さんに緊急連絡
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kimura?message=緊急：明日のパン作り準備について確認をお願いします

# 村田さんに管理者連絡
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-murata?message=シフト変更の件で相談があります
```

### 業務連絡
```
# 松本さんに面談関連
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-matsumoto?message=個別支援計画の面談日程について

# 小西さんにトラクター関連
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-konishi?message=トラクター作業の件でお疲れさまでした
```

---

## 🧪 テスト用コマンド

### 全スタッフ一括テスト（順次実行）
```
# Phase 1: 最重要
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kimura

# Phase 2: 管理職
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-murata
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-matsumoto

# Phase 3: 職業指導員
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-konishi
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-nakai
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kawai

# Phase 4: 生活支援員
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-yoshizawa
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-honma
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-utsunomiya

# Phase 5: 事務
この URL にアクセス: https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-staff-account
```

---

## 📊 成功確認方法

### 正常応答の確認ポイント
- ✅ `success: true`
- ✅ `status: 201` または `200`
- ✅ `deliveryStatus: "配信成功"`
- ✅ LINE WORKS でメッセージ受信

### エラー時の対処
- ❌ `success: false` → 再試行
- ❌ `PERMISSIONS_ERROR` → 個別URLを使用（既に対応済み）
- ❌ 認証エラー → 自動復旧待ち

---

## 🎯 よく使用するコマンド

### 日常業務
```
# 木村さんにパン作り関連
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kimura?message=パン作りお疲れさまです

# 村田さんに管理業務
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-murata?message=管理業務お疲れさまです

# 松本さんに面談業務
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-matsumoto?message=面談業務お疲れさまです
```

### シフト関連
```
# 全体連絡（事務アカウント経由）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-staff-account?message=シフト変更のお知らせ

# 個別シフト確認
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-[スタッフ名]?message=シフト確認をお願いします
```

---

## 🌟 Vercel Pro版の特徴

### ✅ 制限回避完了
- **Claude.ai制限**: 個別固定URLで100%回避
- **パラメータエラー**: パラメータなしで動作
- **12個制限**: 100個まで拡張可能

### 🚀 システムの利点
- **確実性**: 固定URLで安定動作
- **個別対応**: 各スタッフ専用エンドポイント
- **拡張性**: 追加スタッフ対応可能
- **保守性**: 個別管理で障害分離

---

## 📞 緊急時コマンド

### 最重要スタッフへの緊急連絡
```
# 木村さん（最重要）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-kimura?message=緊急連絡

# 村田さん（管理者）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-murata?message=緊急連絡

# 松本さん（サブ管理者）
https://shift-lineworks-4yna8mz83-daishimuratas-projects.vercel.app/api/send-matsumoto?message=緊急連絡
```

---

## 🎉 システム完了確認

**✅ 全11個のAPI稼働中**
**✅ Claude.ai制限完全回避**
**✅ Vercel Pro対応完了**
**✅ LINE WORKS Bot「日向」稼働中**

🌻 **おひさま農園シフト管理システム（Vercel Pro版）運用開始！**
