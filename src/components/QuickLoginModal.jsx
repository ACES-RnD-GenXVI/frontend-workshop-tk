import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
} from "@chakra-ui/react";
import { addAuthLog } from "../data/authLogs";
import { useAppBluetooth, ESP32_SERVICE_UUID, ESP32_CHAR_UUID } from "../components/BluetoothContext";

import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const SCAN_STATE = {
  IDLE: "idle",
  SCANNING: "scanning",
  AUTHENTICATING: "authenticating",
  UID_DETECTED: "uid_detected",
};

const QuickLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { connectedDevice, activeCharacteristic, startNotifications } = useAppBluetooth();
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [detectedUID, setDetectedUID] = useState(null);
  const [manualUIDInput, setManualUIDInput] = useState("");
  const [cardError, setCardError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (unsubscribeRef.current) unsubscribeRef.current();
      setScanState(SCAN_STATE.IDLE);
      setDetectedUID(null);
      setManualUIDInput("");
      setCardError("");
      setScanMessage("");
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    if (!connectedDevice || !activeCharacteristic) {
      setCardError("Perangkat Bluetooth belum terhubung.");
      return;
    }
    setScanState(SCAN_STATE.SCANNING);
    setCardError("");
    setScanMessage("Silakan tempelkan kartu RFID Anda...");
    try {
      const handleDataNotification = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        const uidString = decoder.decode(value).trim();
        if (uidString) {
          setDetectedUID(uidString);
          if (unsubscribeRef.current) unsubscribeRef.current();
          processAuthentication(uidString);
        }
      };
      const unsub = await startNotifications(ESP32_SERVICE_UUID, ESP32_CHAR_UUID, handleDataNotification);
      unsubscribeRef.current = unsub;
    } catch (err) {
      setCardError("Gagal mengaktifkan sensor: " + err.message);
      setScanState(SCAN_STATE.IDLE);
    }
  };

  const processAuthentication = async (uid) => {
    setScanState(SCAN_STATE.AUTHENTICATING);
    setScanMessage("Mencocokkan data kartu ke Firebase Cloud...");

    try {
      const usersCollectionRef = collection(db, "users");
      const uidQuery = query(usersCollectionRef, where("cardUID", "==", uid));
      const querySnapshot = await getDocs(uidQuery);

      if (!querySnapshot.empty) {
        let userCloudData = {};
        querySnapshot.forEach((doc) => {
          userCloudData = doc.data();
        });

        setScanMessage("Otentikasi Cloud Berhasil!");
        setScanState(SCAN_STATE.UID_DETECTED);

        userCloudData.loginTime = new Date().toLocaleTimeString();
        localStorage.setItem("currentUser", JSON.stringify(userCloudData));
        addAuthLog(`RFID Cloud Authentication Success: Card ${uid}`);

        if (activeCharacteristic) {
          const encoder = new TextEncoder();
          activeCharacteristic.writeValue(encoder.encode("1")).catch(console.error);
        }

        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 1000);
      } else {
        setScanMessage("Otentikasi Gagal");
        if (activeCharacteristic) {
          const encoder = new TextEncoder();
          activeCharacteristic.writeValue(encoder.encode("0")).catch(console.error);
        }

        setTimeout(() => {
          setScanState(SCAN_STATE.IDLE);
          setCardError(`Akses Ditolak! Kartu (${uid}) tidak terdaftar dalam sistem cloud.`);
        }, 800);
      }
    } catch (error) {
      setScanState(SCAN_STATE.IDLE);
      setCardError("Koneksi Firebase Cloud Error: " + error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="none" size="sm">
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent borderRadius="16px" border="1px solid" borderColor="gray.100" boxShadow="0 20px 60px rgba(13,45,107,0.18)" mx={4} overflow="hidden">
        <ModalCloseButton size="sm" color="gray.400" top={3} right={3} borderRadius="full" />
        <Box h="3px" bg={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#1a56db" : "#0d2d6b"} />
        <ModalBody py={5} px={7}>
          <VStack spacing={4} align="center">
            <Box w="52px" h="52px" borderRadius="12px" bg={scanState === SCAN_STATE.UID_DETECTED ? "#fff7ed" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#eff4ff" : "#eaeff7"} border="1px solid" borderColor={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#1a56db" : "#c5d4eb"} display="flex" alignItems="center" justifyContent="center">
              <Box as="svg" viewBox="0 0 24 24" w="24px" h="24px" fill="none">
                <Box as="rect" x="2" y="5" width="20" height="14" rx="2" stroke={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#1a56db" : "#7091c4"} strokeWidth="1.5" />
                <Box as="line" x1="2" y1="10" x2="22" y2="10" stroke={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#1a56db" : "#7091c4"} strokeWidth="1.5" />
                <Box as="rect" x="5" y="13" width="4" height="3" rx="0.5" fill={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? "#1a56db" : "#c5d4eb"} />
              </Box>
            </Box>

            <VStack spacing={1} textAlign="center">
              <Text fontSize="16px" fontWeight="700" color="#0d2d6b" letterSpacing="-0.3px">
                {scanState === SCAN_STATE.IDLE && "Smart Login Simulator"}
                {scanState === SCAN_STATE.SCANNING && "Membaca Kartu..."}
                {scanState === SCAN_STATE.AUTHENTICATING && "Validasi Identitas Cloud..."}
                {scanState === SCAN_STATE.UID_DETECTED && "Kartu Dikenali"}
              </Text>
              <Text fontSize="13px" color="gray.500" maxW="220px" lineHeight="1.55">
                {scanState === SCAN_STATE.IDLE && "Masukkan UID hasil registrasi untuk simulasi tap kartu"}
                {scanState !== SCAN_STATE.IDLE && scanMessage}
              </Text>
            </VStack>

            {scanState === SCAN_STATE.IDLE && (
              <VStack w="full" spacing={3}>
                <Input
                  placeholder="Contoh: B3-F4-1A-9D"
                  value={manualUIDInput}
                  onChange={(e) => { setManualUIDInput(e.target.value); setCardError(""); }}
                  textAlign="center"
                  fontWeight="bold"
                  fontFamily="mono"
                  h="44px"
                  borderRadius="8px"
                  bg="gray.50"
                  fontSize="sm"
                />
                <Button onClick={handleStartScan} bg="white" color="#F97316" border="1.5px solid" borderColor="#F97316" _hover={{ bg: "#fff7ed" }} w="full" h="44px" borderRadius="8px" fontSize="sm" fontWeight="700">
                  Tap Kartu
                </Button>
              </VStack>
            )}

            {scanState !== SCAN_STATE.IDLE && (
              <Box w="full" borderRadius="8px" border="1px solid" borderColor={scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : "gray.200"} overflow="hidden">
                {(scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? (
                  <Box px={4} py={3} bg="gray.50">
                    <HStack spacing={2}>
                      <Box w="6px" h="6px" borderRadius="full" bg="#1a56db" flexShrink={0} />
                      <Text fontSize="13px" color="gray.600">{scanMessage}</Text>
                    </HStack>
                  </Box>
                ) : (
                  <Box>
                    <Box px={4} py="6px" bg="#F97316">
                      <Text fontSize="9px" fontWeight="700" color="white" letterSpacing="1.2px" textTransform="uppercase">Card UID Detected</Text>
                    </Box>
                    <Box px={4} py={3} bg="white" textAlign="center">
                      <Text fontSize="20px" fontWeight="700" color="#0d2d6b" letterSpacing="2px" fontFamily="mono">
                        {detectedUID}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {cardError && (
              <Box w="full" px={4} py={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px">
                <Text fontSize="13px" color="red.600" fontWeight="500" textAlign="center">{cardError}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuickLoginModal;