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
  Divider,
} from "@chakra-ui/react";
import Header from "../components/Header";
import QuickLoginModal from "../components/QuickLoginModal";
import { addAuthLog } from "../data/authLogs";

const LoginPage = ({ onNavigateToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const stored = localStorage.getItem("users");
      const users = stored ? JSON.parse(stored) : [];
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        setError("");
        user.loginTime = new Date().toLocaleTimeString();
        localStorage.setItem("currentUser", JSON.stringify(user));
        addAuthLog("Authentication Success");
        onLoginSuccess();
      } else {
        setError("Kredensial salah. Mohon periksa kembali email dan password.");
      }
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box minH="100vh" bg="#eaeff7" display="flex" alignItems="center" justifyContent="center" px={4} py={8}>
      <Box w="full" maxW="540px" bg="white" borderRadius="20px" boxShadow="0 12px 48px rgba(13,45,107,0.15)" px={{ base: 7, sm: 10 }} py={8}>
        <Header />
        <Divider borderColor="gray.100" mb={6} />

        <Box mb={6} textAlign="center">
          <Text fontSize="21px" fontWeight="700" color="#0d2d6b" letterSpacing="-0.5px">Smart Authentication System</Text>
          <Text fontSize="13px" color="gray.500" mt={2}>Secure passwordless hardware authentication</Text>
        </Box>

        <VStack spacing={4}>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={handleKeyDown} placeholder="you@example.com" {...inputStyles} />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} onKeyDown={handleKeyDown} placeholder="••••••••" {...inputStyles} />
          </FormControl>

          {error && (
            <Box w="full" px={4} py={3} bg="red.50" border="1px solid" borderColor="red.200" borderRadius="8px">
              <Text fontSize="13px" color="red.600" fontWeight="500">{error}</Text>
            </Box>
          )}

          <Button onClick={handleLogin} isLoading={isLoading} loadingText="Authenticating..." bg="#0d2d6b" color="white" _hover={{ bg: "#1a3f8f" }} w="full" h="44px" borderRadius="8px" fontSize="sm" fontWeight="600">
            Login
          </Button>

          <Flex align="center" w="full" gap={3}>
            <Divider borderColor="gray.200" />
            <Text fontSize="11px" color="gray.400" whiteSpace="nowrap">atau</Text>
            <Divider borderColor="gray.200" />
          </Flex>

          <Button onClick={() => setIsQuickLoginOpen(true)} w="full" h="48px" borderRadius="8px" fontSize="sm" fontWeight="700" bg="white" color="#F97316" border="1.5px solid" borderColor="#F97316" _hover={{ bg: "#fff7ed" }}>
            Quick Login — Tap Smart Card
          </Button>
        </VStack>

        <Flex align="center" justify="center" mt={6} gap={1}>
          <Text fontSize="sm" color="gray.400">Belum punya akun?</Text>
          <Button variant="link" fontSize="sm" fontWeight="600" color="#0d2d6b" onClick={onNavigateToRegister}>Daftar</Button>
        </Flex>
      </Box>

      <QuickLoginModal isOpen={isQuickLoginOpen} onClose={() => setIsQuickLoginOpen(false)} onLoginSuccess={onLoginSuccess} />
    </Box>
  );
};

export default LoginPage;