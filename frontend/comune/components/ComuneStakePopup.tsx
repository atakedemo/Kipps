import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, DialogContentText } from '@material-ui/core';
import { useState } from 'react';
import RoundedButtonComponent from "./RoundButton";
import { useBalance, useSigner } from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { ethers } from 'ethers';

interface ComuneStakeFormProps {
  buttonText: String;
}

export default function ComuneStakeFormPopup({ buttonText}: ComuneStakeFormProps) {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({ amount: 0.0, tokenType: 'Mathic' });
  const { data, isLoading } = useBalance(NATIVE_TOKEN_ADDRESS);

  const stakePj = async () => {
    try {
      //対象のPJに対して寄付させる
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // ネイティブトークンの送信先アドレスと量
      const tx_to = "0x54d3B05E28cB78204e1171DeC088698eb829523d";
      const tx_amount = ethers.utils.parseEther(String(formValues.amount));//ex. amount=1 -> 1Mathic

      // トランザクションを構築
      const tx = {
        to: tx_to,
        value: tx_amount
      };

      // トランザクションを署名して送信
      const txReceipt = await provider.getSigner().sendTransaction(tx);
      console.log(`Transaction hash: ${txReceipt}`);
      handleCloseDialog;
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
        <DialogTitle>Comune市に寄付する</DialogTitle>
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
          <DialogContentText>
            ※コミュニティにより用途を決定します
          </DialogContentText>
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
