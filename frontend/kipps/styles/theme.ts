import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Heading: {
      sizes: {
        lg: {
          fontSize: '2xl',
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default theme;
