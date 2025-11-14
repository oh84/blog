---
title: 'secretlintを導入'
description: 'secretlintをグローバルのgitフックに設定し、機密情報がリポジトリに含まれてしまうのを予防できるようにしました'
pubDate: '2025-11-14'
---

[前回dotfilesを公開した](../20251113-dotfiles)のですが、その[きっかけとなったイベント](https://supporterz-seminar.connpass.com/event/373029/)で「公開するときには機密情報はアップロードしないように」という注意がありました。その際、参加者の方から「secretlintを使うとよい」といったコメントがあったので、今回導入してみることにしました。

## secretlintとは

secretlintは、AWSのシークレットキーやGitHubのトークンなどの機密情報を検出するツールです。
これをコミット前に実行することで機密情報がリポジトリに含まれてしまうのを防ぐことができます。

<https://github.com/secretlint/secretlint>

## miseのGitHubバックエンドを使ってインストール

インストールはDockerやnpmを使う方法もありましたが、シングルバイナリをダウンロードする方法で行いました。
ここでmiseの「GitHubバックエンド」という機能を使うと簡単にインストールできそうだったので試してみました。

miseではインストールの際に他のパッケージマネージャーやエコシステムを利用する機能があるようで、これを「バックエンド」と呼ぶそうです。

<https://mise.jdx.dev/dev-tools/backends/>

その中にGitHubバックエンドというものがあり、これを使うとGitHub Releasesから適切なOSやアーキテクチャのものを選んで自動でインストールしてくれるとのことです。

<https://mise.jdx.dev/dev-tools/backends/github.html>

```sh
mise use -g github:secretlint/secretlint
```

これだけでインストールできました。めちゃくちゃ便利です。

## secretlintをグローバルのgitフックに設定する

すべてのリポジトリでコミット前にsecretlintを実行するために、グローバルのgitフックに設定しました。
グローバルフックのファイルの場所はcore.hooksPathで指定することができます。

<https://git-scm.com/docs/githooks>

今回は ~/.config/git/hooks に設定しました。

```sh
git config --global core.hooksPath ~/.config/git/hooks
```

<https://github.com/secretlint/secretlint?tab=readme-ov-file#bash-script>  
を参考に ~/.config/git/hooks/pre-commit に以下のスクリプトを設定しました。

```bash
#!/bin/bash

if ! command -v secretlint &>/dev/null; then
	echo "secretlint is not installed"
	exit 1
fi

FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')
[ -z "$FILES" ] && exit 0

SECRETLINTRC="$HOME/.config/secretlint/.secretlintrc.json"
if [ -f .secretlintrc.json ]; then
	SECRETLINTRC=".secretlintrc.json"
fi

# Secretlint all selected files
echo "$FILES" | xargs secretlint --secretlintrc "$SECRETLINTRC"
RET=$?

if [ $RET -ne 0 ] ;then
	exit $RET
fi

echo "[secretlint]"
echo "$(echo "$FILES" | wc -l) files checked:"
echo "$FILES"
echo ""

exit 0
```

実行権限を付与します。

```sh
chmod +x ~/.config/git/hooks/pre-commit
```

secretlintの実行には使用するルールを記載した設定ファイル .secretlintrc.json が必要です。
こちらは下記コマンドで生成できます。

```sh
secretlint --init
```

以下のようなファイルが作成されます。

```json
{
    "rules": [
        {
            "id": "@secretlint/secretlint-rule-preset-recommend"
        },
        {
            "id": "@secretlint/secretlint-rule-pattern"
        }
    ]
}
```

グローバルで使えるように、これを ~/.config/secretlint/.secretlintrc.json に置きました。
上記のスクリプトでは、プロジェクトに固有の .secretlintrc.json がある場合はそちらを使い、なければグローバルの設定を使うようにしています。

これで導入完了です。

## 試してみる

下記サイトにあるデモ用のファイルをコピペしてコミットしてみます。

<https://secretlint.github.io/>

```sh
git add secrets.example

git commit -m "Add secrets.example"
```

すると以下のようなエラーが発生してコミットが失敗しました。
きちんと検出できているようです。

```console
/path/to/repo/secrets.example
   3:5   error  [BasicAuth] found basic auth credential: *****************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-basicauth
   5:14  error  [GITHUB_TOKEN] found GitHub Token(*****************************): ****************************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-github
   9:0   error  [AWSSecretAccessKey] found AWS Secret Access Key: ****************************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-aws
  12:0   error  [SLACK_TOKEN] found slack token: ******************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-slack
  13:0   error  [SLACK_TOKEN] found slack token: ******************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-slack
  14:0   error  [SLACK_TOKEN] found slack token: ******************************                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-slack
  18:0   error  [PrivateKey] found private key: **********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************  @secretlint/secretlint-rule-preset-recommend > @secretlint/secretlint-rule-privatekey

✖ 7 problems (7 errors, 0 warnings, 0 infos)
```

(SendGridのキーだけ検出されてなかったのですが、[@secretlint/secretlint-rule-preset-recommend にはSendGridのルールも含まれているようでした](https://www.npmjs.com/package/@secretlint/secretlint-rule-preset-recommend#rules)。ChatGPTに別のダミーキーを作成してもらって試してみたところそちらのキーは検出できたので、デモサイトの方は本当の形式ではないのかも？しれません。)

## おわりに

以上、secretlintを導入してみました。これで機密情報がリポジトリに含まれてしまうのを予防できるようになりました。今回の設定はdotfilesにも追加しておきました。

<https://github.com/oh84/dotfiles/commit/7e9c5de7e0bc52c7f90e26099aeb5fbb67cd8c46>
