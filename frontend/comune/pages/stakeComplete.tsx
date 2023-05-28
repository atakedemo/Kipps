import type { NextPage } from "next";
import Router from 'next/router';
import { useNetwork, useAddress, useSigner } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { join } from "node:path/win32";

import RoundedButtonComponent from "../components/RoundButton"

const StakeComplete: NextPage = () => {
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();
  const signer = useSigner();

  const moveToTop = async () => {
    try {
      console.log("トップページへ移動する");
      Router.push("index")
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Thank You for Staking!!!!!!
        </h1>
        <div className={styles.connect}>
          <RoundedButtonComponent onClick={moveToTop}>
            トップページへ戻る
          </RoundedButtonComponent>
        </div>
        
      </main>
    </div>
  )
};

export default StakeComplete;
