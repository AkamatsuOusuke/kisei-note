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
- Supabase（Postgres データベース）
- OpenStreetMap Nominatim（地名検索・逆ジオコーディング、APIキー不要）
- 二重投票 / 二重いいねの防止はブラウザの `localStorage` による簡易実装

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトを準備する

1. [Supabase](https://supabase.com/) で新しいプロジェクトを作成します。
2. SQL Editor で `supabase/schema.sql` の内容を貼り付けて実行します（テーブル・RLSポリシー・いいね/投票用の関数がまとめて作成されます）。
3. Project Settings → API から `Project URL` と `anon public` キーを取得します。
4. `.env.example` を `.env` にコピーし、取得した値を貼り付けます。

```bash
cp .env.example .env
```

> このアプリはログイン機能を持たないため、匿名キー(anon key)で誰でも読み書きできる簡易なRLSポリシーになっています。本格的に公開する場合はSupabase Authと組み合わせてポリシーを強化してください。

### 3. 開発サーバーを起動

```bash
npm run dev
```

## データ構造（Supabase / Postgres）

```
places
  id, city_key(unique), city, prefecture, country, lat, lng
  kaisei_count      … 「帰省したい」の合計数
  created_at

charms
  id, place_id(→ places.id), content
  likes_count
  created_at
```

`city_key` は `国コード|緯度(小数2桁)|経度(小数2桁)` の形式で、同じ場所の重複登録を防ぎます。

## デプロイ

Vite製の静的サイトなので、Vercel / Netlify / GitHub Pages など任意の静的ホスティングにデプロイできます。

```bash
npm run build
```

ビルド成果物は `dist/` に出力されます。デプロイ先に環境変数 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定するのを忘れずに。
