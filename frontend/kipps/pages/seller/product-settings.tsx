import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, Select } from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from '../../components/Header'
import { ChainId, useAddress, useChainId} from '@thirdweb-dev/react';
const { ethers } = require('ethers');
import abiTicketJson from '../../abi/ticket.json';

const ProductSettings = () => {
  const [name, setName] = useState('');
  const [discription, setDiscription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();
  const contractAddress='0x4C874CCacA16f482b872Cb323174bc0D3636E3Bb';
  const contractAbi=abiTicketJson.abi;

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDiscriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscription(event.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(file){
      setImage(file)
    };
  };

  const handleSubmit = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
        // Get Current Id
        const contract = new ethers.Contract(contractAddress,contractAbi,provider);
        const result = await contract.ticketCount();
        console.log(parseInt(result.toString()))
        const id = parseInt(result.toString()) * 10;

        // Upload Metadata via AWS
        let tmpFile;
        if (!image) {
          tmpFile = 'https://dao-org.4attraem.com/assets/no_image.jpeg'
        } else {
          tmpFile = image;
        }
        const response = await axios.post(
          'https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/chainlink/metadata', 
          {
            'image': tmpFile,
            'chainId': '8001',
            'name': name,
            'description': discription,
            'attributes': [
              {
                'value': 'Type',
                'trait_type': 'Ticket'
              }
            ],
            'animation_url': '',
            'nft_contract_address': contractAddress,
            'token_id': id
          }
        );
        router.push(`/seller/price/${id}`);
    } catch (error) {
        console.error(error);
    }
  };

  const handleUploadImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) {
      console.error('写真を選択してください');
      return;
    }

    //Encode base64
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      const base64data = reader.result;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        // Get Current Id
        const response = await axios.post(
          'https://1vlevj4eak.execute-api.ap-northeast-1.amazonaws.com/demo/projects/image', 
          {
            'image_data': JSON.stringify({ photo: base64data })
          }
        );
        console.log(response.data.body);
        setImage(response.data.body);
      } catch (error) {
        console.error(error);
      }
    };
  }

  return (
    <Box>
      <Header/>
      <Box>
        <Box padding={4} backgroundColor='#F2F1EF'>
          <form onSubmit={handleSubmit}>
            <FormControl marginBottom={4}>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={handleNameChange} backgroundColor='white' />
            </FormControl>
            <FormControl marginBottom={4}>
              <FormLabel>discription</FormLabel>
              <Input value={discription} onChange={handleDiscriptionChange} backgroundColor='white' />
            </FormControl>
            <Button backgroundColor='#8C7370' color='white' onClick={handleSubmit}>
              Next
            </Button>
          </form>
        </Box>
        <Box padding={4} backgroundColor='#F2F1EF'>
          <form onSubmit={handleUploadImage}>
            <FormControl marginBottom={4}>
              <FormLabel>Image</FormLabel>
              <Input type='file' accept='image/*' onChange={handleImageChange}/>
            </FormControl>
            <Button type='submit' backgroundColor='#8C7370' color='white'>
              Upload Image
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductSettings;
