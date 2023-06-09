import { ConnectWallet, useAddress, useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Header = () => {
    const router = useRouter();
  
    const handleSetting = () => {
      router.push(`/seller/product-settings`)
    };
  
    return (
      <Flex
        as="header"
        align="center"
        justify="space-between"
        padding={4}
        backgroundColor="#F2F1EF"
      >
        <Box>
          <Image
            src="https://dao-org.4attraem.com/assets/Kippus_logo.png"
            alt="ロゴ"
            height={20}
            width={40}
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer' }}
          />
        </Box>
        <Box>
            <Button 
                colorScheme="#F2F1EF"
                color="#000000"
                onClick={handleSetting} 
                margin={4}
            >
                Product Setting
            </Button>
            <Button 
                colorScheme="#F2F1EF"
                color="#000000"
                onClick={()=> router.push('/owner/owns')} 
                margin={4}
            >
                My Tickets
            </Button>
            <ConnectWallet />
        </Box>
      </Flex>
    );
};

export default Header;