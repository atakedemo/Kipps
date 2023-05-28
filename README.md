# デモ用のスマートコントラクト
***
## 処理概要
* 対象のウォレットに対してトークンを付与する
* NFT(ERC1155)はあらかじめ発行(mint)しておき、所有権を相手に移す<br>※ガス代は運営側(本システム)にて負担する

***
## 環境設定のコマンド
初期設定
```shell
npm init -y
npm install --save-dev hardhat
npx hardhat
```

必要ライブラリのインストール
```shell
npm install @openzeppelin/contracts
npm install dotenv --save
```

デプロイ
```shell
npx hardhat run --network NETWORK_NAME(local/goerli/mumbai) scripts/deploy.ts
```

デプロイしたコントラクトの検証
```shell
npx hardhat verify --network (local/goerli/mumbai) デプロイしたコントラクトAddress
```
