// src/components/QuickLoginModal.jsx

import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { addAuthLog } from "../data/authLogs";

const MOCK_UID = "A4-B2-F9-1C";

const SCAN_STATE = {
  IDLE: "idle",
  SCANNING: "scanning",
  AUTHENTICATING: "authenticating",
  UID_DETECTED: "uid_detected",
};

const QuickLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [scanState, setScanState] = useState(SCAN_STATE.IDLE);
  const [detectedUID, setDetectedUID] = useState(null);
  const [cardError, setCardError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScanState(SCAN_STATE.IDLE);
      setDetectedUID(null);
      setCardError("");
      setScanMessage("");
    }
  }, [isOpen]);

  // User-triggered scan — called on button click
  const handleStartScan = () => {
    setScanState(SCAN_STATE.SCANNING);
    setCardError("");
    setScanMessage("Connecting to ESP32 Module...");

    setTimeout(() => setScanMessage("Establishing Secure Channel..."), 700);
    setTimeout(() => setScanMessage("Reading RFID Card..."), 1400);
    setTimeout(() => {
      setScanState(SCAN_STATE.AUTHENTICATING);
      setScanMessage("Decrypting Card Identifier...");
    }, 2100);
    setTimeout(() => setScanMessage("Matching Database..."), 2800);

    setTimeout(() => {
      const stored = localStorage.getItem("users");
      const users = stored ? JSON.parse(stored) : [];
      const uid = users.length > 0 ? users[users.length - 1].cardUID : MOCK_UID;
      const user = users.find((u) => u.cardUID === uid);

      if (user) {
        setScanMessage("Authentication Success");
        setDetectedUID(uid);
        setScanState(SCAN_STATE.UID_DETECTED);
        user.loginTime = new Date().toLocaleTimeString();
        localStorage.setItem("currentUser", JSON.stringify(user));
        addAuthLog("RFID Authentication");
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 800);
      } else {
        setScanMessage("Authentication Failed");
        setTimeout(() => {
          setScanState(SCAN_STATE.IDLE);
          setCardError("Card not registered. Please register your card first.");
        }, 800);
      }
    }, 3500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="none"
      size="sm"
    >
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent
        borderRadius="16px"
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 20px 60px rgba(13,45,107,0.18)"
        mx={4}
        overflow="hidden"
      >
        <ModalCloseButton
          size="sm"
          color="gray.400"
          top={3}
          right={3}
          transition="all 0.25s ease"
          _hover={{ color: "gray.700", bg: "gray.100", transform: "translateY(-1px)" }}
          _active={{ transform: "scale(0.98)" }}
          borderRadius="full"
        />

        {/* Top accent strip */}
        <Box h="3px" bg={
          scanState === SCAN_STATE.UID_DETECTED
            ? "#F97316"
            : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
            ? "#1a56db"
            : "#0d2d6b"
        } />

        <ModalBody py={5} px={7}>
          <VStack spacing={4} align="center">

            {/* Card icon */}
            <Box
              w="52px"
              h="52px"
              borderRadius="12px"
              bg={
                scanState === SCAN_STATE.UID_DETECTED
                  ? "#fff7ed"
                  : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
                  ? "#eff4ff"
                  : "#eaeff7"
              }
              border="1px solid"
              borderColor={
                scanState === SCAN_STATE.UID_DETECTED
                  ? "#F97316"
                  : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
                  ? "#1a56db"
                  : "#c5d4eb"
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box as="svg" viewBox="0 0 24 24" w="24px" h="24px" fill="none">
                <Box
                  as="rect"
                  x="2"
                  y="5"
                  width="20"
                  height="14"
                  rx="2"
                  stroke={
                    scanState === SCAN_STATE.UID_DETECTED
                      ? "#F97316"
                      : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
                      ? "#1a56db"
                      : "#7091c4"
                  }
                  strokeWidth="1.5"
                />
                <Box
                  as="line"
                  x1="2"
                  y1="10"
                  x2="22"
                  y2="10"
                  stroke={
                    scanState === SCAN_STATE.UID_DETECTED
                      ? "#F97316"
                      : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
                      ? "#1a56db"
                      : "#7091c4"
                  }
                  strokeWidth="1.5"
                />
                <Box
                  as="rect"
                  x="5"
                  y="13"
                  width="4"
                  height="3"
                  rx="0.5"
                  fill={
                    scanState === SCAN_STATE.UID_DETECTED
                      ? "#F97316"
                      : (scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING)
                      ? "#1a56db"
                      : "#c5d4eb"
                  }
                />
              </Box>
            </Box>

            {/* Text */}
            <VStack spacing={1} textAlign="center">
              <Text
                fontSize="16px"
                fontWeight="700"
                color="#0d2d6b"
                letterSpacing="-0.3px"
              >
                {scanState === SCAN_STATE.IDLE && "Quick Login"}
                {scanState === SCAN_STATE.SCANNING && "Scanning RFID Card..."}
                {scanState === SCAN_STATE.AUTHENTICATING && "Authenticating Card..."}
                {scanState === SCAN_STATE.UID_DETECTED && "Card Detected"}
              </Text>
              <Text fontSize="13px" color="gray.500" maxW="200px" lineHeight="1.55">
                {scanState === SCAN_STATE.IDLE && "Tap your Smart Card to continue"}
                {scanState === SCAN_STATE.SCANNING && scanMessage}
                {scanState === SCAN_STATE.AUTHENTICATING && scanMessage}
                {scanState === SCAN_STATE.UID_DETECTED && scanMessage}
              </Text>
            </VStack>

            {/* Status / UID readout */}
            {scanState !== SCAN_STATE.IDLE && (
              <Box w="full" borderRadius="8px" border="1px solid" borderColor={
                scanState === SCAN_STATE.UID_DETECTED ? "#F97316" : "gray.200"
              } overflow="hidden">
                {(scanState === SCAN_STATE.SCANNING || scanState === SCAN_STATE.AUTHENTICATING) ? (
                  <Box px={4} py={3} bg="gray.50">
                    <HStack spacing={2}>
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="#1a56db"
                        flexShrink={0}
                      />
                      <Text fontSize="13px" color="gray.600">
                        {scanMessage}
                      </Text>
                    </HStack>
                  </Box>
                ) : (
                  <Box>
                    {/* Readout header */}
                    <Box
                      px={4}
                      py="6px"
                      bg="#F97316"
                    >
                      <Text
                        fontSize="9px"
                        fontWeight="700"
                        color="white"
                        letterSpacing="1.2px"
                        textTransform="uppercase"
                      >
                        Card UID Detected
                      </Text>
                    </Box>
                    {/* Readout body */}
                    <Box px={4} py={3} bg="white">
                      <Text
                        fontSize="20px"
                        fontWeight="700"
                        color="#0d2d6b"
                        letterSpacing="4px"
                        fontFamily="mono"
                      >
                        {detectedUID}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Start Scanning button — IDLE state only */}
            {scanState === SCAN_STATE.IDLE && (
              <Button
                onClick={handleStartScan}
                bg="white"
                color="#F97316"
                border="1.5px solid"
                borderColor="#F97316"
                transition="all 0.25s ease"
                _hover={{ bg: "#fff7ed", transform: "translateY(-1px)" }}
                _active={{ bg: "#ffedd5", transform: "scale(0.98)" }}
                w="full"
                h="44px"
                borderRadius="8px"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.2px"
              >
                Start Scanning
              </Button>
            )}

            {/* Card not registered error */}
            {cardError && (
              <Box
                w="full"
                px={4}
                py={3}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="8px"
              >
                <Text fontSize="13px" color="red.600" fontWeight="500" textAlign="center">
                  {cardError}
                </Text>
              </Box>
            )}

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuickLoginModal;
