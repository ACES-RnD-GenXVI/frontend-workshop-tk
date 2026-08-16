// src/pages/SuccessPage.jsx

import {
  Box,
  Button,
  Divider,
  Flex,
  Text,
  VStack,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import Header from "../components/Header";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import { getAuthLogs } from "../data/authLogs";
import { useEffect, useState, useCallback, useRef } from "react";

const REDIRECT_URL = "https://www.umn.ac.id/teknik-komputer/";
const COUNTDOWN_SECONDS = 5;
const REDIRECTED_ONCE_KEY = "redirectedOnce";

const MOCK_UID = "A4-B2-F9-1C";

const CONFETTI = [
  { left: "8%", delay: 0, duration: 2.8, color: "#F97316", rotate: 0 },
  { left: "20%", delay: 0.25, duration: 3.1, color: "#3b82f6", rotate: 45 },
  { left: "33%", delay: 0.1, duration: 2.6, color: "#22c55e", rotate: 90 },
  { left: "47%", delay: 0.4, duration: 3.3, color: "#fbbf24", rotate: 135 },
  { left: "61%", delay: 0.2, duration: 2.9, color: "#a855f7", rotate: 180 },
  { left: "74%", delay: 0.5, duration: 3.0, color: "#F97316", rotate: 225 },
  { left: "88%", delay: 0.15, duration: 2.7, color: "#3b82f6", rotate: 270 },
];

const SuccessPage = ({ onLogout }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const [recentLogs, setRecentLogs] = useState([]);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [wasRedirected, setWasRedirected] = useState(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    setRecentLogs(getAuthLogs().slice(0, 3));
  }, []);

  // Countdown + auto-redirect (sekali per login)
  useEffect(() => {
    // Sudah pernah redirect di login ini → tampilkan statis, tanpa countdown
    if (localStorage.getItem(REDIRECTED_ONCE_KEY) === "true") {
      setWasRedirected(true);
      setCountdown(0);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          redirectedRef.current = true;
          localStorage.setItem(REDIRECTED_ONCE_KEY, "true");
          window.location.href = REDIRECT_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Cleanup: stops the timer if user logs out before countdown ends
    return () => clearInterval(interval);
  }, []);

  // Setelah kembali dari redirect (tombol Back / bfcache), jangan auto-redirect lagi
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted && redirectedRef.current) {
        setWasRedirected(true);
        setCountdown(0);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleRedirectNow = useCallback(() => {
    window.location.href = REDIRECT_URL;
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
    <PageShell>
      {/* Main card */}
      <GlassCard
        px={{ base: 7, sm: 10 }}
        py={8}
        animation="fadeInUp 0.4s ease-out forwards"
      >
        {/* Confetti overlay */}
        <Box position="absolute" inset={0} pointerEvents="none">
          {CONFETTI.map((c, i) => (
            <Box
              key={i}
              position="absolute"
              top="-12px"
              left={c.left}
              w="8px"
              h="14px"
              borderRadius="2px"
              bg={c.color}
              transform={`rotate(${c.rotate}deg)`}
              style={{
                animation: `confettiFall ${c.duration}s ease-in ${c.delay}s forwards`,
              }}
            />
          ))}
        </Box>

        {/* Logos */}
        <Header />

        <Divider borderColor="gray.100" mb={6} />

        {/* Profil User*/}
        <Box 
          p={4} 
          bg="gray.50" 
          borderRadius="14px" 
          border="1px solid" 
          borderColor="gray.200" 
          mb={6}
        >
          <HStack spacing={4}>
            <Avatar 
              name={currentUser.name || "Admin"} 
              bg="#0d2d6b" 
              color="white" 
              size="md" 
            />
            <VStack align="flex-start" spacing={0} flex={1}>
              <Text 
                fontSize="9px" 
                fontWeight="700" 
                color="#F97316" 
                textTransform="uppercase" 
                letterSpacing="0.8px"
              >
                Authenticated Profile
              </Text>
              <Text fontSize="16px" fontWeight="700" color="#0d2d6b">
                {currentUser.name || "Admin User"}
              </Text>
              <Text fontSize="12px" color="gray.500">
                {currentUser.email || "admin@tekkom.com"}
              </Text>
            </VStack>
          </HStack>
        </Box>
        {/* ============================================================================ */}

        {/* Success indicator */}
        <VStack spacing={1} mb={6} textAlign="center">
          <Box mb={3} position="relative">
            <Box
              position="absolute"
              inset="8px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(34,197,94,0.35), transparent 70%)"
              filter="blur(4px)"
            />
            <Box as="svg" viewBox="0 0 52 52" w="64px" h="64px" mx="auto" position="relative">
              <Box
                as="circle"
                cx="26"
                cy="26"
                r="24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray="151"
                strokeDashoffset="151"
                transform="rotate(-90 26 26)"
                style={{ animation: "drawCircle 0.6s ease-out forwards" }}
              />
              <Box
                as="path"
                fill="none"
                stroke="#16a34a"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                strokeDashoffset="40"
                d="M14 27l8 8 16-17"
                style={{ animation: "drawCheck 0.45s ease-out 0.55s forwards" }}
              />
            </Box>
          </Box>
          <Text
            fontSize="11px"
            fontWeight="800"
            color="#16a34a"
            letterSpacing="2px"
            textTransform="uppercase"
          >
            Access Granted
          </Text>
          <Text
            fontSize="20px"
            fontWeight="700"
            color="#0d2d6b"
            letterSpacing="-0.5px"
            mt={1}
          >
            Authentication successful.
          </Text>
          <Text fontSize="13px" color="gray.500" mt={1}>
            Welcome to Computer Engineering UMN,{" "}
            <Box as="span" fontWeight="600" color="#0d2d6b">
              {currentUser.name || "Admin"}
            </Box>
            .
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

        {/* ── Redirect CTA ─────────────────────────────────────────── */}
        <Box
          mb={4}
          p={4}
          borderRadius="12px"
          border="1px solid"
          borderColor="#bbf7d0"
          bg="#f0fdf4"
        >
          {/* Primary redirect button */}
          <Button
            onClick={handleRedirectNow}
            bgGradient="linear(to-r, #0d2d6b, #1a3f8f)"
            color="white"
            w="full"
            h="44px"
            borderRadius="8px"
            fontSize="sm"
            fontWeight="700"
            letterSpacing="0.2px"
            mb={3}
            transition="all 0.25s ease"
            _hover={{ bgGradient: "linear(to-r, #163a80, #2458c4)", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(13,45,107,0.4)" }}
            _active={{ transform: "scale(0.98)" }}
            rightIcon={<Box as="span" fontSize="14px">→</Box>}
          >
            Continue to Teknik Komputer UMN
          </Button>

          {/* Countdown progress bar */}
          {!wasRedirected && (
            <Box w="full" h="4px" bg="rgba(16,185,129,0.18)" borderRadius="full" overflow="hidden" mb={2} boxShadow="inset 0 0 4px rgba(16,185,129,0.25)">
              <Box
                h="full"
                bgGradient="linear(to-r, #22c55e, #10b981)"
                borderRadius="full"
                boxShadow="0 0 12px rgba(34,197,94,0.8)"
                style={{
                  width: `${(countdown / COUNTDOWN_SECONDS) * 100}%`,
                  transition: "width 1s linear",
                }}
              />
            </Box>
          )}

          {/* Countdown text */}
          <Flex align="center" justify="center" gap={1}>
            <Box w="6px" h="6px" borderRadius="full" bg={wasRedirected ? "#F97316" : countdown > 0 ? "#16a34a" : "#bbf7d0"} flexShrink={0} />
            <Text fontSize="12px" color={wasRedirected ? "#F97316" : "#16a34a"} fontWeight="600">
              {wasRedirected
                ? "Anda telah dialihkan. Gunakan tombol di atas untuk membukanya lagi."
                : countdown > 0
                  ? `Redirecting in ${countdown} second${countdown !== 1 ? "s" : ""}…`
                  : "Redirecting…"}
            </Text>
          </Flex>
        </Box>
        {/* ─────────────────────────────────────────────────────────── */}

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
      </GlassCard>
    </PageShell>
  );
};

export default SuccessPage;