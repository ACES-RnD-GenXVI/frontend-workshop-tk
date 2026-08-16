import { Flex, Image, Box, Text, HStack, Button } from "@chakra-ui/react";
import { useAppBluetooth } from "./BluetoothContext";

const Header = () => {
  const { connectedDevice, openPairingModal, disconnect } = useAppBluetooth() || {};

  return (
    <Box mb={6}>
      {/* Logos */}
      <Flex align="center" justify="center" gap={5} mb={3}>
        <Image
          src="/umn.png"
          alt="Universitas Multimedia Nusantara"
          h="44px"
          objectFit="contain"
        />
        <Box w="1px" h="28px" bg="gray.200" flexShrink={0} />
        <Image
          src="/LogoACES.png"
          alt="ACES Computer Engineering UMN"
          h="44px"
          objectFit="contain"
        />
      </Flex>

      {/* Hardware Status Pill */}
      <Flex justify="center">
        {connectedDevice ? (
          <HStack
            bg="rgba(34, 197, 94, 0.08)"
            border="1px solid"
            borderColor="rgba(34, 197, 94, 0.3)"
            px={3}
            py={1}
            borderRadius="full"
            spacing={2}
            backdropFilter="blur(4px)"
          >
            <Box
              w="7px"
              h="7px"
              borderRadius="full"
              bg="#22c55e"
              boxShadow="0 0 8px #22c55e"
              style={{ animation: "pulse 2s infinite" }}
            />
            <Text fontSize="11px" fontWeight="600" color="#15803d">
              ESP32: {connectedDevice.name || "Terhubung"}
            </Text>
            <Text fontSize="10px" color="gray.400">|</Text>
            <Button
              size="xs"
              variant="unstyled"
              fontSize="10px"
              fontWeight="600"
              color="#dc2626"
              h="auto"
              p={0}
              _hover={{ textDecoration: "underline" }}
              onClick={disconnect}
            >
              Putus
            </Button>
          </HStack>
        ) : (
          <HStack
            bg="rgba(249, 115, 22, 0.08)"
            border="1px solid"
            borderColor="rgba(249, 115, 22, 0.3)"
            px={3}
            py={1}
            borderRadius="full"
            spacing={2}
            backdropFilter="blur(4px)"
          >
            <Box w="7px" h="7px" borderRadius="full" bg="#f97316" />
            <Text fontSize="11px" fontWeight="600" color="#c2410c">
              ESP32: Belum Terhubung
            </Text>
            <Text fontSize="10px" color="gray.400">|</Text>
            <Button
              size="xs"
              variant="unstyled"
              fontSize="10px"
              fontWeight="700"
              color="#ea580c"
              h="auto"
              p={0}
              _hover={{ textDecoration: "underline" }}
              onClick={openPairingModal}
            >
              ⚡ Hubungkan
            </Button>
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
