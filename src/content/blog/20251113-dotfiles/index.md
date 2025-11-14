---
title: '設定ファイルをdotfilesで管理する'
description: '設定ファイルをdotfilesで管理する'
pubDate: '2025-11-13'
---

先日、下記のイベントに参加しました。

【勉強会】絶対に設定しておきたいshell環境  
<https://supporterz-seminar.connpass.com/event/373029/>

こちらでshell環境について色々聞くことができたのですが、その中で「dotfilesを公開しよう」という話がありました。
ということで、自分も作成して公開してみました。

アップしたものがこちらです。  
<https://github.com/oh84/dotfiles>

実は前にも作成しようとしたことはあって途中まで色々いじってはいたのですが、今回を機に少し調べながらまた整理してみました。  
基本的な内容は以下の通りです。

- macOS用
- install.sh 実行で一括インストール
- パッケージマネージャーはHomebrew
- 設定ファイルはシンボリックリンクで配置
- 管理している設定ファイル:
  - homebrew
  - git
  - zsh (プラグイン管理: sheldon)
  - starship
  - tmux (プラグイン管理: tpm)
  - vim (プラグイン管理: vim-plug)
  - mise
  - ghostty
  - karabiner
  - hammerspoon

今回設定していく中で、gitの設定ファイルについていくつか知ったことがありました。

- グローバルのconfigファイルは ~/.gitconfig でなく ~/.config/git/config でもよい (両方あってもよい)
- グローバルのignoreファイルのデフォルトは ~/.config/git/ignore
- 無視するファイルは各リポジトリの .git/info/exclude でも設定可能

そこでgitの設定ファイルは ~/.config/git 配下に置いた方がまとまってよさそうだったので、そちらに置くようにしました。  
あとexcludeファイルもtemplatesディレクトリの中に置くようにしてみました。正直ignoreファイルと使い分けるユースケースが思いつかないので使うことはないかもしれませんが。。実際まだ中身は空です。

これから少しずつ更新していければと思います。
Homebrewがいつの間にかARMのLinuxにも対応していたのでLinuxでも使えるようにしたいです。
