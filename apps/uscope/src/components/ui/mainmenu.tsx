import { Flex, Box, Link } from '@chakra-ui/react';

const MainMenu: React.FC = () => {
  return (
    <Flex
      as="nav"
      color="white"
      padding="1rem 2rem"
      justifyContent="space-between"
      alignItems="center"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Box fontWeight="bold" fontSize="xl">
        MyLogo
      </Box>

      <Flex gap="1.5rem">
        <Link href="#home" _hover={{ textDecoration: 'underline' }}>
          Home
        </Link>
        <Link href="#about" _hover={{ textDecoration: 'underline' }}>
          About
        </Link>
        <Link href="#services" _hover={{ textDecoration: 'underline' }}>
          Services
        </Link>
        <Link href="#contact" _hover={{ textDecoration: 'underline' }}>
          Contact
        </Link>
      </Flex>
    </Flex>
  );
};

export default MainMenu;
