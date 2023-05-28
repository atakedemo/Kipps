import type { NextPage } from "next";
import { useState, useEffect } from 'react';
import { ConnectWallet, ChainId, useNetwork, useAddress, useSigner } from "@thirdweb-dev/react";
import { Grid, Box, Typography, Button } from '@material-ui/core';
import styles from "../styles/Home.module.css";
import { useProjectListStyles } from '../styles/list';
import axios from 'axios';

import ComuneStakeFormPopup from '../components/ComuneStakePopup'
import PjStakeFormPopup from '../components/PjStakePopup'

interface Project {
  pj_id: String;
  pj_name: String;
  category: String;
  description: String;
  image: String;
  contract: String;
}

const Stake: NextPage = () => {
  const stylesList = useProjectListStyles();
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  //ToDo: ロールを加える
  const [projects, setProjects] = useState<Project[]>([
    {
      "pj_id": "000",
      "pj_name":"None",
      "category":"None",
      "description":"Null",
      "image":"https://example.com",
      "contract": "0x000000000000000000000"
    }
  ]);
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get<Project[]>('https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/projects');
        setProjects(JSON.parse(response.data.body).Items);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTodos();
  }, []);

  if (address && network && network?.data?.chain?.id !== ChainId.Mumbai) {
    console.log(network?.data?.chain?.id)
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
            投資受付
          </h1>
          
          <div>
            <h2>村全体へ投資する</h2>
            <ComuneStakeFormPopup
                buttonText={!address ? "Prease Connect Wallet" : "投資(Mathic)"} 
            />
          </div>
          <h2>プロジェクトへ投資する</h2>
          
          <div className={stylesList.root}>
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item key={project.pj_id} xs={12} sm={6} md={4} lg={3}>
                  <Box className={stylesList.project}>
                    <Typography variant="h6">{project.pj_name}</Typography>
                    <img src={project.image} className={stylesList.projectImage} />
                    <Typography variant="body1">{project.description}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <PjStakeFormPopup
                          buttonText={!address ? "Prease Connect Wallet" : "投資(Mathic)"} project={project}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </div>
        </main>
      </div>
    );
  }
};

export default Stake;
