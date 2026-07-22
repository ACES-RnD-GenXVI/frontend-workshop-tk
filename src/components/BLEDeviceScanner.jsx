import { Box, Button, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import { useAppBluetooth } from "./context/BluetoothContext";

const BLEDeviceScanner = ({ onDeviceSelected }) => {
  const toast = useToast();
  const { isBluetoothAvailable, startScan, isScanning, error } = useAppBluetooth();

  const handleScan = async () => {
    if (!isBluetoothAvailable()) {
      toast({
        title: "Bluetooth tidak tersedia",
        description: "Browser Anda tidak mendukung Web Bluetooth atau fitur ini dinonaktifkan.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const device = await startScan();
      if (device) {
        toast({
          title: "Perangkat ditemukan",
          description: `Menemukan perangkat: ${device.name || "Unknown device"}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onDeviceSelected(device);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} bg="white" boxShadow="sm">
      <VStack spacing={4} align="flex-start">
        <Heading size="md">Hubungkan ke Perangkat ESP32</Heading>

        <Button
          colorScheme="blue"
          onClick={handleScan}
          isLoading={isScanning}
          loadingText="Memindai..."
          w="full"
        >
          Pindai Perangkat ESP32
        </Button>

        {error && (
          <Text color="red.500">
            Error: Pemindaian dibatalkan atau metode tidak didukung.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default BLEDeviceScanner;