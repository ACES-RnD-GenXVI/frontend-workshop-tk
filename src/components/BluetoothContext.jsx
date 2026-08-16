// src/context/BluetoothContext.jsx
import React, { createContext, useContext, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useToast,
  Box,
  HStack
} from "@chakra-ui/react";
import { useBLE } from "../hooks/useBLE";

const BluetoothContext = createContext(null);

export const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"; 
export const ESP32_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export const BluetoothProvider = ({ children }) => {
  const toast = useToast();
  const [showPopup, setShowPopup] = useState(() => !localStorage.getItem("currentUser"));
  const [activeCharacteristic, setActiveCharacteristic] = useState(null);
  const [isPopupConnecting, setIsPopupConnecting] = useState(false);

  const { 
    isBluetoothAvailable, 
    startScan, 
    isScanning,
    connectToDevice, 
    connectedDevice, 
    disconnect, 
    startNotifications,
    error 
  } = useBLE({
    services: [ESP32_SERVICE_UUID],
  });

  const handlePairing = async () => {
    if (!isBluetoothAvailable()) {
      toast({
        title: "Bluetooth Tidak Didukung",
        description: "Browser Anda tidak mendukung Web Bluetooth API.",
        status: "error",
        duration: 4000,
      });
      return;
    }

    setIsPopupConnecting(true);
    try {
      const device = await startScan();
      if (device) {
        const result = await connectToDevice(device);
        if (result && result.services[ESP32_SERVICE_UUID]) {
          const char = result.services[ESP32_SERVICE_UUID][ESP32_CHAR_UUID];
          setActiveCharacteristic(char);
          setShowPopup(false);
          toast({
            title: "Hardware Terhubung",
            description: `Sukses terhubung ke ${device.name || "ESP32 Device"}`,
            status: "success",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPopupConnecting(false);
    }
  };

  return (
    <BluetoothContext.Provider 
      value={{ 
        connectedDevice, 
        activeCharacteristic, 
        setActiveCharacteristic,
        startNotifications, 
        disconnect, 
        handlePairing,
        isBluetoothAvailable,
        startScan,
        isScanning,
        connectToDevice,
        error,
        openPairingModal: () => setShowPopup(true),
        showPopup,
        setShowPopup
      }}
    >
      {children}

      <Modal isOpen={showPopup} onClose={() => setShowPopup(false)} closeOnOverlayClick={false} isCentered size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="20px" mx={4} border="1px solid" borderColor="rgba(255,255,255,0.2)" boxShadow="0 20px 60px rgba(13,45,107,0.3)">
          <ModalHeader color="#0d2d6b" textAlign="center" pt={6} pb={2} fontWeight="700" fontSize="lg">
            ⚡ Koneksi Smart Hardware ESP32
          </ModalHeader>
          <ModalBody pb={4} px={6}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Hubungkan laptop kamu ke node ESP32 via Bluetooth untuk mengaktifkan fitur Smart Login RFID & Pembaca Kartu.
              </Text>

              {/* Status Box */}
              {connectedDevice ? (
                <Box p={3} bg="green.50" borderRadius="12px" border="1px solid" borderColor="green.200">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="#22c55e" boxShadow="0 0 8px #22c55e" />
                      <Text fontSize="xs" color="green.800" fontWeight="700">
                        Terhubung: {connectedDevice.name || "ESP32 Device"}
                      </Text>
                    </HStack>
                    <Button size="xs" colorScheme="red" variant="ghost" onClick={disconnect}>
                      Putus Koneksi
                    </Button>
                  </HStack>
                </Box>
              ) : (
                <Box p={3.5} bg="#fff7ed" borderRadius="12px" border="1px solid" borderColor="#ffedd5">
                  <Text fontSize="xs" color="#c2410c" fontWeight="700" mb={2}>
                    💡 Petunjuk Singkat Pairing Kelompok:
                  </Text>
                  <VStack align="start" spacing={1.5} fontSize="xs" color="#9a3412">
                    <Text>1️⃣ <b>Aktifkan Bluetooth</b> di Laptop & nyalakan daya ESP32.</Text>
                    <Text>2️⃣ Pastikan memakai browser <b>Google Chrome</b> atau <b>MS Edge</b>.</Text>
                    <Text>3️⃣ Klik tombol di bawah & pilih nama BLE kelompokmu (misal: <i>ESP32-Kelompok-1</i>).</Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} justifyContent="center" pb={6} pt={2}>
            <Button variant="ghost" size="sm" fontSize="xs" color="gray.500" onClick={() => setShowPopup(false)}>
              Lewati (Mode Simulasi)
            </Button>
            <Button
              bgGradient="linear(to-r, #F97316, #ea580c)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, #ea580c, #c2410c)", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}
              _active={{ transform: "scale(0.98)" }}
              isLoading={isPopupConnecting}
              loadingText="Mencari ESP32..."
              onClick={handlePairing}
              size="sm"
              borderRadius="10px"
              px={5}
              fontWeight="600"
            >
              {connectedDevice ? "Hubungkan Ulang" : "Hubungkan Bluetooth"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </BluetoothContext.Provider>
  );
};

export const useAppBluetooth = () => useContext(BluetoothContext);