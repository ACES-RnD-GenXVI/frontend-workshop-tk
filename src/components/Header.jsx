// src/components/Header.jsx

import { Flex, Image, Box } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex align="center" justify="center" gap={5} mb={6}>
      <Image
        src="/umn.png"
        alt="Universitas Multimedia Nusantara"
        h="48px"
        objectFit="contain"
      />
      <Box w="1px" h="30px" bg="gray.200" flexShrink={0} />
      <Image
        src="/LogoACES.png"
        alt="ACES Computer Engineering UMN"
        h="48px"
        objectFit="contain"
      />
    </Flex>
  );
};

export default Header;
