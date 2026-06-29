// src/pages/SuccessPage.jsx

import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";
import Header from "../components/Header";
import { getAuthLogs } from "../data/authLogs";
import { useEffect, useState } from "react";

const MOCK_UID = "A4-B2-F9-1C";

const SuccessPage = ({ onLogout }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    setRecentLogs(getAuthLogs().slice(0, 3));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    onLogout();
  };

  const statusItems = [
    { label: "Security Protocol", value: "Secure", color: "#16a34a" },
    { label: "Card UID", value: currentUser.cardUID || MOCK_UID, mono: true, color: "#0d2d6b" },
    { label: "Verification Method", value: "Smart Card", color: "#0d2d6b" },
    { label: "Session Timestamp", value: currentUser.loginTime || new Date().toLocaleTimeString(), color: "#16a34a" },
  ];

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

        {/* Success indicator */}
        <VStack spacing={1} mb={6} textAlign="center">
          <Box
            w="48px"
            h="48px"
            borderRadius="full"
            bg="#f0fdf4"
            border="1px solid"
            borderColor="#bbf7d0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            <Text fontSize="22px" lineHeight="1">✓</Text>
          </Box>
          <Text
            fontSize="21px"
            fontWeight="700"
            color="#0d2d6b"
            letterSpacing="-0.5px"
          >
            Authentication Success
          </Text>
          <Text fontSize="13px" color="gray.400" mt={1}>
            Welcome, {currentUser.name || "Admin"}
          </Text>
        </VStack>

        {/* Status readout */}
        <Box
          borderRadius="10px"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          mb={5}
        >
          {/* Readout header */}
          <Box
            px={4}
            py="7px"
            bg="#eaeff7"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Text
              fontSize="10px"
              fontWeight="700"
              color="#0d2d6b"
              letterSpacing="0.8px"
              textTransform="uppercase"
            >
              Security Protocol
            </Text>
          </Box>

          {/* Status rows */}
          <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>
            {statusItems.map((item) => (
              <Flex
                key={item.label}
                px={4}
                py={3}
                align="center"
                justify="space-between"
                bg="white"
              >
                <Text fontSize="13px" color="gray.500" fontWeight="500">
                  {item.label}
                </Text>
                <Text
                  fontSize="13px"
                  fontWeight="700"
                  color={item.color}
                  fontFamily={item.mono ? "mono" : "body"}
                  letterSpacing={item.mono ? "1.5px" : "normal"}
                >
                  {item.value}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Recent Activity */}
        <Box mb={5}>
          <Text fontSize="10px" fontWeight="700" color="#0d2d6b" letterSpacing="0.8px" textTransform="uppercase" mb={3}>
            Recent Activity
          </Text>
          <VStack spacing={2} align="stretch">
            {recentLogs.map((log, i) => (
              <Flex key={i} justify="space-between" align="center">
                <Text fontSize="13px" color="gray.500" fontFamily="mono">
                  {log.timestamp}
                </Text>
                <Text fontSize="13px" color="gray.600" fontWeight="500">
                  {log.action}
                </Text>
              </Flex>
            ))}
            {recentLogs.length === 0 && (
              <Text fontSize="13px" color="gray.400">
                No recent activity.
              </Text>
            )}
          </VStack>
        </Box>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          w="full"
          h="44px"
          borderRadius="8px"
          fontSize="sm"
          fontWeight="600"
          borderColor="gray.200"
          color="gray.600"
          transition="all 0.25s ease"
          _hover={{ borderColor: "gray.300", bg: "gray.50", transform: "translateY(-1px)" }}
          _active={{ bg: "gray.100", transform: "scale(0.98)" }}
          letterSpacing="0.2px"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessPage;
