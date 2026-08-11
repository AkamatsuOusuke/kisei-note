# 帰省ノート (kisei-note)

「帰省」をテーマにしたアプリです。地元と現在地、それぞれの場所の魅力を見つけて届け合います。

[travel-note](https://github.com/AkamatsuOusuke/travel-note) の「旅先でノートが降ってくる」演出をベースに、帰省向けに作り直しました。背景は巨大な画像を埋め込まず、軽量な CSS グラデーションで表現しています。

## できること

1. **地元を登録** — 地名を検索して自分の地元を登録します（初回のみ）。
2. **現在地を取得** — 位置情報から現在地の市町村を取得します。
3. 地元と現在地が異なる場所なら、**2冊の本**（地元 / 現在地）が草原に降ってきます。同じ場所なら**現在地の本1冊**だけが降ってきます。
   - **地元の本**：その街にいる人たちが投稿した「魅力」を読める本。気に入った投稿には ❤️ いいねができ、ページ上部の **「帰省したい」ボタン** で気持ちを届けられます。
   - **現在地の本**：今いる場所で見つけた魅力を自由に投稿できる本。
4. **ランキング** — 「帰省したい」を多く集めた市町村を、ヘッダーの 🏆 ランキング から確認できます。

## 技術構成

- React 19 + Vite
- Firebase Firestore（データベース）
- OpenStreetMap Nominatim（地名検索・逆ジオコーディング、APIキー不要）
- 二重投票 / 二重いいねの防止はブラウザの `localStorage` による簡易実装

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase プロジェクトを準備する

1. [Firebase コンソール](https://console.firebase.google.com/) で新しいプロジェクトを作成します。
2. 「Firestore Database」を有効化します（本番モードでOK。ルールは後述の `firebase/firestore.rules` を使います）。
3. 「プロジェクトの設定 → 全般 → マイアプリ」でウェブアプリを追加し、SDK の設定値を取得します。
4. `.env.example` を `.env` にコピーし、取得した値を貼り付けます。

```bash
cp .env.example .env
```

### 3. Firestore のセキュリティルールを反映する

このアプリはログイン機能を持たないため、匿名で読み書きできる簡易ルール（`firebase/firestore.rules`）を用意しています。[Firebase CLI](https://firebase.google.com/docs/cli) を使う場合:

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # 作成したプロジェクトを選択
firebase deploy --only firestore:rules
```

CLIを使わない場合は、Firebase コンソールの Firestore → ルール タブに `firebase/firestore.rules` の内容を貼り付けても構いません。

> 誰でも書き込める簡易ルールです。本格的に公開する場合は Firebase Authentication と組み合わせてルールを強化してください。

### 4. 開発サーバーを起動

```bash
npm run dev
```

## データ構造（Firestore）

```
places/{cityKey}
  city, prefecture, country, lat, lng
  kaisei_count      … 「帰省したい」の合計数
  created_at

  charms/{charmId}  … その場所に投稿された「魅力」
    content
    likes_count
    created_at
```

`cityKey` は `国コード|緯度(小数2桁)|経度(小数2桁)` の形式で、同じ場所の重複登録を防ぎます。

## デプロイ

```bash
npm run build
firebase deploy --only hosting
```
