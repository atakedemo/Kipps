import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, DialogContentText } from '@material-ui/core';
import { useSigner, useAddress } from "@thirdweb-dev/react";
import { useState } from 'react';
import axios from 'axios';
import RoundedButtonComponent from "./RoundButton"

interface NftFormProps {
  buttonText: string;
}

export default function NftFormPopup({ buttonText }: NftFormProps) {
  const [open, setOpen] = useState(false);
  const [openComplete, setOpenComplete] = useState(false);
  const [formValues, setFormValues] = useState({ name: ''});
  const signer = useSigner();
  const address = useAddress();

  const mintNFT = async () => {
    try {
      console.log("NFTミントのポップアップを表示する");
      //デジタル署名させてWalletの所有者を特定 -> 署名で認証させてnftをサーバーで発行(バックエンドで発行フラグは制御)
      const message = "村人としてのnft市民証を発行する";
      const signature = await signer?.signMessage(message);
      console.log(signature);
      // signatureを引数にAPIを実行
      try {
        const response = await axios.post(
          'https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/users', 
          {
            'address': address,
            'name': formValues.name
          }
        );

        if (response.status === 200) {
          console.log(response)
          setOpenComplete(true);
          setOpen(false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setOpen(false);
      }
    } catch (error) {
      console.log(error)
    }
  };

  const handleOpenDialog = () => {setOpen(true);};
  const handleCloseDialog = () => {setOpen(false);};
  const handleOpenDialogComplete = () => {setOpenComplete(true);};
  const handleCloseDialogComplete = () => {setOpenComplete(false);};

  return (
    <>
      <RoundedButtonComponent onClick={handleOpenDialog}>
        {buttonText}
      </RoundedButtonComponent>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Enter your information</DialogTitle>
        <DialogContent>
          <TextField
            label="User Name"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={mintNFT} color="primary">
            NFTをミントする
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openComplete} onClose={setOpenComplete}>
        <DialogTitle>市民証(NFT)発行受付 ※数分かかります（下記リンクを確認ください）</DialogTitle>
        <DialogContent>
          <DialogContentText>
          https://testnets.opensea.io/ja/assets/mumbai/0xccad304e9b5a6b69168dd2e791f01021cf3295b9/2
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogComplete} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
