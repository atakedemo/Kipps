import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import theme from '../styles/theme';
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { Ethereum, Polygon, Mumbai } from "@thirdweb-dev/chains";

const activeChainId = ChainId.Mumbai;

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ThirdwebProvider activeChain={Mumbai}
      supportedChains={[Mumbai ]}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ThirdwebProvider>
  );
};

export default MyApp;
