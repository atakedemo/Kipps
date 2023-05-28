import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, DialogContentText } from '@material-ui/core';
import { useState } from 'react';
import RoundedButtonComponent from "./RoundButton";
import { useBalance } from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { ethers } from 'ethers';

type Project = {
  pj_id: String;
  pj_name: String;
  category: String;
  description: String;
  image: String;
  contract: String;
}

interface PjStakeFormProps {
  buttonText: String;
  project: Project;
}

export default function PjStakeFormPopup({ buttonText, project }: PjStakeFormProps) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({ amount: 0.0, tokenType: 'Mathic' });
  const { data, isLoading } = useBalance(NATIVE_TOKEN_ADDRESS);

  const stakePj = async () => {
    try {
      //対象のPJに対して寄付させる
      //ToDo: デモ以降では、寄付受付のコントラクトを実行する
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ネイティブトークンの送信先アドレスと量
      const tx_to = project.contract;
      const tx_amount = ethers.utils.parseEther(String(formValues.amount));//ex. amount=1 -> 1Mathic

      // トランザクションを構築
      const tx = {
        to: tx_to,
        value: tx_amount
      };

      // トランザクションを署名して送信
      const txReceipt = await provider.getSigner().sendTransaction(tx);
      //console.log(`Transaction hash: ${txReceipt.hash}`);
    } catch (error) {
      console.log(error)
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <RoundedButtonComponent onClick={handleOpenDialog}>
        {buttonText}
      </RoundedButtonComponent>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>{project.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Balance({data?.symbol}): {data?.displayValue.substr(0,5)}
          </DialogContentText>
          <TextField
            label="Amount"
            type="number"
            value={formValues.amount}
            onChange={(e) => setFormValues({ ...formValues, amount: Number(e.target.value) })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={stakePj} color="primary">
            投資する
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
