// src/context/BluetoothContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
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
        error
      }}
    >
      {children}

      <Modal isOpen={showPopup} onClose={() => setShowPopup(false)} closeOnOverlayClick={false} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="15px" mx={4}>
          <ModalHeader color="#0d2d6b" textAlign="center" pt={6} fontWeight="700">
            Koneksi Smart Hardware
          </ModalHeader>
          <ModalBody pb={6}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="sm" color="gray.600">
                Aplikasi ini memerlukan koneksi Bluetooth ke ESP32 Authentication Node untuk dapat menggunakan fitur Smart Login RFID.
              </Text>
              <Box p={3} bg="orange.50" borderRadius="8px" border="1px dashed" borderColor="orange.300" w="full">
                <Text fontSize="xs" color="orange.700" fontWeight="600">
                  Pastikan Bluetooth Laptop/HP & ESP32 Anda telah menyala!
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} justifyContent="center" pb={6}>
            <Button variant="ghost" size="sm" onClick={() => setShowPopup(false)}>
              Lewati (Gunakan Manual)
            </Button>
            <Button
              bg="#F97316"
              color="white"
              _hover={{ bg: "#ea6c0a" }}
              isLoading={isPopupConnecting}
              loadingText="Menghubungkan..."
              onClick={handlePairing}
              size="sm"
              borderRadius="8px"
            >
              Hubungkan Bluetooth
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </BluetoothContext.Provider>
  );
};

export const useAppBluetooth = () => useContext(BluetoothContext);