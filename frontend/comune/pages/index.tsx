import type { NextPage } from "next";
import Router from 'next/router';

// 接続中のネットワークを取得するため useNetwork を新たにインポートします。
import { ConnectWallet, ChainId, useNetwork, useAddress } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { join } from "node:path/win32";
import RoundedButtonComponent from "../components/RoundButton"

const Home: NextPage = () => {
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();

  const joinMurabito = async () => {
    try {
      Router.push("murabito");
    } catch (error) {
      console.log(error)
    }
  };

  const joinPatlon = async () => {
    try {
      Router.push("stake");
    } catch (error) {
      console.log(error)
    }
  };

  if (address && network && network?.data?.chain?.id !== ChainId.Mumbai) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Polygon Testnet(Mumbai)に切り替えてください⚠️</h1>
          <p>この dApp は Polygon Testnet(Mumbai)のみで動作します。</p>
          <p>ウォレットから接続中のネットワークを切り替えてください。</p>
        </main>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            ようこそ Comune市
          </h1>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
          <div className={styles.connect}>
            <RoundedButtonComponent onClick={joinMurabito}>
              {!address ? "Prease Connect Wallet" : "Join as 村人(Murabito)"}
            </RoundedButtonComponent>
          </div>
          <div className={styles.connect}>
            <RoundedButtonComponent onClick={joinPatlon}>
              {!address ? "Prease Connect Wallet" : "Join as Patlon"}
            </RoundedButtonComponent>
          </div>
        </main>
      </div>
    );
  }
};

export default Home;
