import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Badge,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAppBluetooth, ESP32_SERVICE_UUID, ESP32_CHAR_UUID } from "./context/BluetoothContext";

const BLEDeviceManager = ({
  device,
  onConnected,
  onDisconnected,
  onServicesDiscovered,
}) => {
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Konsumsi state koneksi aplikasi dari Context bersama
  const { 
    connectToDevice, 
    disconnect, 
    connectedDevice, 
    setActiveCharacteristic,
    error 
  } = useAppBluetooth();

  useEffect(() => {
    if (connectedDevice) {
      onConnected(connectedDevice);
    } else {
      onDisconnected && onDisconnected();
    }
  }, [connectedDevice, onConnected, onDisconnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await connectToDevice(device);
      if (result) {
        // Daftarkan gatt characteristic ke context global agar modul Login & Register bisa langsung memakainya
        if (result.services && result.services[ESP32_SERVICE_UUID]) {
          const char = result.services[ESP32_SERVICE_UUID][ESP32_CHAR_UUID];
          setActiveCharacteristic(char);
        }

        if (result.services && onServicesDiscovered) {
          onServicesDiscovered(result.services);
        }

        toast({
          title: "Terhubung",
          description: `Berhasil terhubung ke ${device.name || "device"}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Koneksi gagal",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setActiveCharacteristic(null); // Bersihkan characteristic saat terputus
    toast({
      title: "Terputus",
      description: `Hubungan dengan ${device.name || "device"} diputuskan`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} bg="white" boxShadow="sm">
      <VStack spacing={4} align="flex-start">
        <HStack justifyContent="space-between" width="100%">
          <Heading size="md">{device.name || "Unknown Device"}</Heading>
          <Badge colorScheme={connectedDevice ? "green" : "gray"}>
            {connectedDevice ? "Connected" : "Disconnected"}
          </Badge>
        </HStack>

        <Text fontSize="sm">Device ID: {device.id}</Text>

        {connectedDevice ? (
          <Button colorScheme="red" onClick={handleDisconnect} w="full">
            Putuskan Koneksi
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleConnect}
            isLoading={isConnecting}
            loadingText="Menghubungkan..."
            w="full"
          >
            Hubungkan
          </Button>
        )}

        {error && <Text color="red.500">Error: {error}</Text>}
      </VStack>
    </Box>
  );
};

export default BLEDeviceManager;