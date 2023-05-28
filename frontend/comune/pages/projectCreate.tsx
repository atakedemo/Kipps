import type { NextPage } from "next";
import Router from 'next/router';
import React, { useState } from "react";
import axios from 'axios';
import { Button,TextField,Container,Grid,Paper,Typography } from '@material-ui/core';

import { ChainId, useNetwork, useAddress } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { useFormStyles } from '../styles/form';
import RoundedButtonComponent from "../components//RoundButton";

interface FormValues {
  name: string;
  category: string;
  description: string;
  image: string;
  contract: string;
}

const ProjectCreate: NextPage = () => {
  const address = useAddress();
  const [network, switchNetwork] = useNetwork();
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    category: '',
    description: '',
    image: 'https://dao-org.4attraem.com/assets/no_image.jpeg',
    contract: ''
  });

  const classes = useFormStyles();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const onImgUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!photo) {
      console.error("写真を選択してください");
      return;
    }

    // ファイルをBase64にエンコード
    const reader = new FileReader();
    reader.readAsDataURL(photo);
    reader.onloadend = async () => {
      const base64data = reader.result;

      // APIリクエストの送信
      try {
        const response = await axios.post(
          'https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/projects/image', 
          {
            'image_data': JSON.stringify({ photo: base64data })
          }
        );
        console.log(response.data);
        console.log(response.data.body);
        setFormValues((prevValues) => ({
          ...prevValues,
          ['image']: response.data.body,
        }));
      } catch (error) {
        console.error(error);
      }
    };
  };

  const routeTop = async () => {
    Router.push("murabito");
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        'https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/projects', 
        formValues
      );
      if (response.status === 200) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
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
  } else if (submitted) {
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Typography variant="h5">PJが登録されました</Typography>
        </Paper>
        <RoundedButtonComponent onClick={routeTop}>
          Go To TOP Page
        </RoundedButtonComponent>
      </div>
    );
  } else {
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">PJ登録フォーム</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <form className={classes.form} onSubmit={handleSubmit}>
                <TextField
                  required
                  id="name"
                  name="name"
                  label="Name"
                  value={formValues.name}
                  onChange={handleInputChange}
                />
                <TextField
                  required
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  maxRows={4}
                  variant="standard"
                  value={formValues.description}
                  onChange={handleInputChange}
                />
                <TextField
                  required
                  id="contract"
                  name="contract"
                  label="Wallet Address"
                  multiline
                  maxRows={4}
                  variant="standard"
                  value={formValues.contract}
                  onChange={handleInputChange}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting}
                  className={classes.button}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </Grid>
            <Grid item xs={6}>
              <form className={classes.form} onSubmit={onImgUpload}>
                <img src={formValues.image} className={classes.projectImage} />
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  className={classes.button}
                >
                  写真をアップロード
                </Button>
              </form>
            </Grid>
          </Grid>
        </Paper>
        
      </div>
    );    
  }
};

export default ProjectCreate;
