import type { NextPage } from "next";
import Router from 'next/router';

import { ConnectWallet, ChainId, useNetwork, useAddress } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import NftFormPopup from '../components/NftPopup';
import RoundedButtonComponent from "../components//RoundButton";

const Murabito: NextPage = () => {
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();

  const routeStekeToken = async () => {
    Router.push("stake");
  };

  const routePjCreate = async () => {
    Router.push("projectCreate");
  }

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
        <div className={styles.connect}>
            <ConnectWallet />
          </div>
          <h1 className={styles.title}>
            コミューン村
          </h1>
          
          <div className={styles.button_menu}>
            <NftFormPopup 
              buttonText={!address ? "Prease Connect Wallet" : "住民票(NFT)を発行する"} 
            />
          </div>
          <div className={styles.button_menu}>
            <RoundedButtonComponent onClick={routePjCreate}>
              {!address ? "Prease Connect Wallet" : "プロジェクトを提案する"}
            </RoundedButtonComponent>
          </div>
          <div className={styles.button_menu}>
            <h2>パトロンとして参加する</h2>
            <RoundedButtonComponent onClick={routeStekeToken}>
              {!address ? "Prease Connect Wallet" : "プロジェクトか村に寄付する"}
            </RoundedButtonComponent>
          </div>
          
        </main>
      </div>
    );
  }
};

export default Murabito;
