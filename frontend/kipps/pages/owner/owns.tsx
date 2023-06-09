import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Network, Alchemy } from "alchemy-sdk";
import Header from '../../components/Header';

const settings = {
  apiKey: "XfoX4Vg1rQjEG85P719b85NCn98wVEFG",
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(settings);

type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
};

const products: Product[] = [
  { id: 10, name: "sample ticket", image: "https://dao-org.4attraem.com/assets/e62d625e-5b20-4848-bb5d-71c9d01ae219.png", price: 1 },
  { id: 30, name: 'Outdoor PGM', image: "https://dao-org.4attraem.com/assets/16fa6730-ee61-44a7-a075-e335d96ef4a9.png", price: 2 },
];

const ProductList = () => {
  const router = useRouter();
  const [NFTs, setNFTs] = useState<any>();

  const fetchNftData = async() => {
    console.log("Now!!!!");
    const tmpNFTs = await alchemy.nft.getNftsForContract("0xFBaD63bAbe3C6324e6B49e15C6e87D58A0282295");
    setNFTs(tmpNFTs.nfts);
    console.log(NFTs);
  }
 
  useEffect(() => {
    fetchNftData();
  },[]);

  return (
    <Box padding={4}>
      <Heading as="h2" size="lg" marginBottom={4}>
        My ticket
      </Heading>
      <Flex flexWrap="wrap">
        {products.map((product) => (
          <Box
            key={product.id}
            width={{ base: '100%', sm: '50%', md: '33%', lg: '25%' }}
            padding={2}
            cursor="pointer"
            onClick={() => router.push(`/owner/products/${product.id}`)}
            _hover={{ transform: 'scale(1.05)' }}
          >
            <Box
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
            >
              <Image src={product.image} alt={product.name} height={200} width="100%" />
              <Box padding={4}>
                <Heading as="h3" size="lg" marginBottom={2}>
                  {product.name}
                </Heading>
                <Text>Price: {product.price}.00 Link</Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Flex>
      {/*
      <Flex flexWrap="wrap">
        {NFTs.map((nft:any) => (
          <Text>id:{nft.tokenId}</Text>
        ))}
      </Flex>
      */}
    </Box>

  );
};

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    // ログイン処理や初期データの取得などの副作用を実行
  }, []);

  return (
    <Box>
      <Header />
      <ProductList />
    </Box>
  );
};

export default Home;
