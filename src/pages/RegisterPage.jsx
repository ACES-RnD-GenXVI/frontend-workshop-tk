// src/pages/RegisterPage.jsx

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Divider,
  useToast,
} from "@chakra-ui/react";
import Header from "../components/Header";
import { addAuthLog } from "../data/authLogs";

const MOCK_UID = "A4-B2-F9-1C";

const RegisterPage = ({ onNavigateToLogin }) => {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedUID, setDetectedUID] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [scanMessage, setScanMessage] = useState("Waiting for RFID Card...");

  const inputStyles = {
    bg: "gray.50",
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "8px",
    _hover: { borderColor: "gray.300", bg: "white" },
    transition: "all 0.2s ease",
    _focus: {
      bg: "white",
      borderColor: "#1a56db",
      boxShadow: "0 0 0 3px rgba(59,130,246,0.12)",
      outline: "none",
    },
    fontSize: "sm",
    h: "44px",
  };

  const generateRandomUID = () => {
    const chars = '0123456789ABCDEF';
    let uid = '';
    for (let i = 0; i < 4; i++) {
      uid += chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)];
      if (i < 3) uid += '-';
    }
    return uid;
  };

  const handleConnectSmartCard = () => {
    setIsConnecting(true);
    setDetectedUID(null);
    setScanMessage("Initializing RFID Reader...");

    setTimeout(() => setScanMessage("Scanning Smart Card..."), 600);
    setTimeout(() => setScanMessage("Generating Secure Identifier..."), 1200);
    setTimeout(() => setScanMessage("Binding Card To User..."), 1800);

    setTimeout(() => {
      setIsConnecting(false);
      setDetectedUID(generateRandomUID());
      setScanMessage("Card Linked Successfully");
    }, 2400);
  };

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      const stored = localStorage.getItem("users");
      const users = stored ? JSON.parse(stored) : [];

      // Duplicate email check
      const exists = users.find((u) => u.email === email);
      if (exists) {
        toast({
          title: "Email already registered.",
          description: "Please use a different email address.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      // Duplicate RFID check
      const cardExists = users.some((u) => u.cardUID === detectedUID);
      if (cardExists) {
        toast({
          title: "Smart Card already registered",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      // Save new user
      const newUser = { name, email, password, cardUID: detectedUID };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      addAuthLog("New User Registered");

      toast({
        title: "Account registered successfully.",
        description: "You can now log in with your credentials.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      onNavigateToLogin();
    }, 1500);
  };

  const uidReady = detectedUID !== null;

  return (
    <Box
      minH="100vh"
      bg="#eaeff7"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      {/* Main card */}
      <Box
        w="full"
        maxW="540px"
        bg="white"
        borderRadius="20px"
        boxShadow="0 12px 48px rgba(13,45,107,0.15), 0 2px 8px rgba(0,0,0,0.08)"
        px={{ base: 7, sm: 10 }}
        py={8}
        animation="fadeInUp 0.4s ease-out forwards"
      >
        {/* Logos */}
        <Header />

        <Divider borderColor="gray.100" mb={6} />

        {/* Title + subtitle */}
        <Box mb={6} textAlign="center">
          <Text
            fontSize="21px"
            fontWeight="700"
            color="#0d2d6b"
            letterSpacing="-0.5px"
            lineHeight="1.25"
          >
            Create Account
          </Text>
          <Text fontSize="13px" color="gray.500" mt={2} lineHeight="1.6" letterSpacing="0.1px">
            Secure passwordless authentication
          </Text>
        </Box>

        {/* Form */}
        <VStack spacing={4}>
          {/* Name */}
          <FormControl>
            <FormLabel
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="0.8px"
              mb={1.5}
            >
              Full Name
            </FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              {...inputStyles}
            />
          </FormControl>

          {/* Email */}
          <FormControl>
            <FormLabel
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="0.8px"
              mb={1.5}
            >
              Email
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              {...inputStyles}
            />
          </FormControl>

          {/* Password */}
          <FormControl>
            <FormLabel
              fontSize="10px"
              fontWeight="700"
              color="gray.400"
              textTransform="uppercase"
              letterSpacing="0.8px"
              mb={1.5}
            >
              Password
            </FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              {...inputStyles}
            />
          </FormControl>

          <Divider borderColor="gray.100" />

          {/* Smart Card section */}
          <Box w="full">

            <Button
              onClick={handleConnectSmartCard}
              isLoading={isConnecting}
              loadingText="Reading card..."
              isDisabled={uidReady}
              w="full"
              h="44px"
              borderRadius="8px"
              fontSize="sm"
              fontWeight="700"
              bg={uidReady ? "#16a34a" : "#F97316"}
              color="white"
              transition="all 0.25s ease"
              _hover={uidReady ? { bg: "#16a34a", transform: "translateY(-1px)" } : { bg: "#ea6c0a", transform: "translateY(-1px)" }}
              _active={uidReady ? { transform: "scale(0.98)" } : { bg: "#d46009", transform: "scale(0.98)" }}
              _disabled={{ opacity: 1, cursor: "not-allowed", transform: "none" }}
              letterSpacing="0.2px"
            >
              {uidReady ? "✓ Smart Card Linked" : "Connect Smart Card"}
            </Button>

            {/* Status readout — always visible */}
            <Box
              mt={2}
              borderRadius="8px"
              border="1px solid"
              borderColor={uidReady ? "#bbf7d0" : "gray.200"}
              overflow="hidden"
            >
              {!uidReady ? (
                <Box px={4} py={3} bg="gray.50">
                  <HStack spacing={2}>
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg={isConnecting ? "#F97316" : "gray.300"}
                      flexShrink={0}
                    />
                    <Text fontSize="13px" color={isConnecting ? "gray.600" : "gray.400"}>
                      {scanMessage}
                    </Text>
                  </HStack>
                </Box>
              ) : (
                <Box>
                  <Box px={4} py="6px" bg="#f0fdf4" borderBottom="1px solid" borderColor="#bbf7d0">
                    <Text fontSize="10px" fontWeight="700" color="#16a34a" letterSpacing="0.8px" textTransform="uppercase">
                      Card UID Detected
                    </Text>
                  </Box>
                  <Box px={4} py={3} bg="white">
                    <Text
                      fontSize="18px"
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
          </Box>

          {/* Register Account */}
          <Button
            onClick={handleRegister}
            isLoading={isRegistering}
            loadingText="Creating Account..."
            isDisabled={!uidReady}
            bg={uidReady ? "#0d2d6b" : "gray.100"}
            color={uidReady ? "white" : "gray.400"}
            transition="all 0.25s ease"
            _hover={{ bg: uidReady ? "#1a3f8f" : "gray.100", transform: uidReady ? "translateY(-1px)" : "none" }}
            _active={{ bg: uidReady ? "#0a2254" : "gray.100", transform: uidReady ? "scale(0.98)" : "none" }}
            _disabled={{ opacity: 1, cursor: "not-allowed", transform: "none" }}
            w="full"
            h="44px"
            borderRadius="8px"
            fontSize="sm"
            fontWeight="600"
            letterSpacing="0.3px"
          >
            Register Account
          </Button>
        </VStack>

        {/* Back to login */}
        <Flex align="center" justify="center" mt={6} gap={1}>
          <Text fontSize="sm" color="gray.400">
            Sudah punya akun?
          </Text>
          <Button
            variant="link"
            fontSize="sm"
            fontWeight="600"
            color="#0d2d6b"
            transition="all 0.2s ease"
            onClick={onNavigateToLogin}
            _hover={{ color: "#1a3f8f", textDecoration: "underline", transform: "translateY(-1px)" }}
            _active={{ transform: "scale(0.98)" }}
          >
            Masuk
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default RegisterPage;
