// src/pages/MentorPage.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useToast,
} from "@chakra-ui/react";
import Header from "../components/Header";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import { MENTOR_PASSCODE, MENTOR_RESET_CONFIRM_TEXT } from "../config";

import { db } from "../firebase";
import { collection, getDocs, writeBatch } from "firebase/firestore";

const MentorPage = ({ onBack }) => {
  const toast = useToast();
  const [passcode, setPasscode] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [userCount, setUserCount] = useState(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const loadUserCount = async () => {
    setIsLoadingCount(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUserCount(snapshot.size);
    } catch (err) {
      toast({
        title: "Gagal membaca data",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsLoadingCount(false);
    }
  };

  useEffect(() => {
    if (isAuthed) loadUserCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const handleAuth = () => {
    if (passcode.trim() === MENTOR_PASSCODE) {
      setAuthError("");
      setIsAuthed(true);
    } else {
      setAuthError("Passcode salah.");
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const docs = snapshot.docs;
      let deleted = 0;

      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        docs.slice(i, i + 500).forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        deleted += Math.min(500, docs.length - i);
      }

      toast({
        title: "Reset Selesai",
        description: `${deleted} akun berhasil dihapus.`,
        status: "success",
      });
      setIsConfirmOpen(false);
      setConfirmText("");
      await loadUserCount();
    } catch (err) {
      toast({
        title: "Reset Gagal",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearLocal = () => {
    ["currentUser", "users", "authLogs", "redirectedOnce"].forEach((key) =>
      localStorage.removeItem(key)
    );
    toast({ title: "Data lokal browser dibersihkan", status: "info" });
  };

  return (
    <PageShell>
      <GlassCard px={{ base: 7, sm: 10 }} py={8}>
        <Header />
        <Divider borderColor="gray.100" mb={6} />

        {!isAuthed ? (
          <VStack spacing={4} align="stretch">
            <Box textAlign="center" mb={2}>
              <Text
                fontSize="21px"
                fontWeight="700"
                color="#0d2d6b"
                letterSpacing="-0.5px"
              >
                Mentor Mode
              </Text>
              <Text fontSize="13px" color="gray.500" mt={1}>
                Masukkan passcode untuk mengelola data workshop.
              </Text>
            </Box>

            <FormControl>
              <FormLabel
                fontSize="10px"
                fontWeight="700"
                color="gray.400"
                textTransform="uppercase"
              >
                Passcode
              </FormLabel>
              <Input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setAuthError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="••••••••"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="8px"
                h="44px"
                fontSize="sm"
              />
            </FormControl>

            {authError && (
              <Box
                px={4}
                py={3}
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="8px"
              >
                <Text fontSize="13px" color="red.600" fontWeight="500">
                  {authError}
                </Text>
              </Box>
            )}

            <Button
              onClick={handleAuth}
              bg="#0d2d6b"
              color="white"
              _hover={{ bg: "#1a3f8f" }}
              w="full"
              h="44px"
              borderRadius="8px"
              fontSize="sm"
              fontWeight="600"
            >
              Masuk
            </Button>

            <Button variant="link" fontSize="sm" color="gray.500" onClick={onBack}>
              ← Kembali ke Login
            </Button>
          </VStack>
        ) : (
          <VStack spacing={5} align="stretch">
            <HStack justify="space-between" align="center">
              <Box>
                <Text
                  fontSize="10px"
                  fontWeight="700"
                  color="#F97316"
                  textTransform="uppercase"
                  letterSpacing="0.8px"
                >
                  Mentor Mode
                </Text>
                <Text fontSize="18px" fontWeight="700" color="#0d2d6b">
                  Dashboard Data Workshop
                </Text>
              </Box>
              <Badge colorScheme="orange">Aktif</Badge>
            </HStack>

            <Box
              p={4}
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="12px"
            >
              <HStack justify="space-between" align="center">
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="11px" color="gray.500" fontWeight="600">
                    Akun Terdaftar
                  </Text>
                  <Text
                    fontSize="30px"
                    fontWeight="800"
                    color="#0d2d6b"
                    lineHeight="1.1"
                  >
                    {isLoadingCount ? "…" : userCount ?? "—"}
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadUserCount}
                  isLoading={isLoadingCount}
                >
                  Muat Ulang
                </Button>
              </HStack>
            </Box>

            <Box
              p={4}
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="12px"
            >
              <Text fontSize="13px" fontWeight="700" color="red.700" mb={1}>
                Hapus Semua Data Workshop
              </Text>
              <Text fontSize="12px" color="red.500" mb={3}>
                Menghapus seluruh akun peserta & data UID kartu dari database.
                Tindakan ini tidak bisa dibatalkan.
              </Text>
              <Button
                onClick={() => setIsConfirmOpen(true)}
                bg="red.600"
                color="white"
                _hover={{ bg: "red.700" }}
                w="full"
                h="44px"
                borderRadius="8px"
                fontSize="sm"
                fontWeight="700"
              >
                Reset Semua Data Workshop
              </Button>
            </Box>

            <Button variant="outline" size="sm" onClick={handleClearLocal}>
              Bersihkan data lokal browser ini
            </Button>

            <Button
              variant="link"
              fontSize="sm"
              color="gray.500"
              onClick={() => {
                setIsAuthed(false);
                setPasscode("");
              }}
            >
              Keluar dari Mentor Mode
            </Button>
          </VStack>
        )}
      </GlassCard>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="14px" mx={4}>
          <ModalHeader color="red.600" fontWeight="700">
            Konfirmasi Reset
          </ModalHeader>
          <ModalBody>
            <Text fontSize="14px" color="gray.600" mb={3}>
              Semua akun peserta akan dihapus permanen. Ketik{" "}
              <Box as="span" fontFamily="mono" fontWeight="700" color="#0d2d6b">
                {MENTOR_RESET_CONFIRM_TEXT}
              </Box>{" "}
              untuk melanjutkan.
            </Text>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={MENTOR_RESET_CONFIRM_TEXT}
              textAlign="center"
              fontWeight="bold"
              fontFamily="mono"
              h="44px"
              borderRadius="8px"
              bg="gray.50"
              fontSize="sm"
            />
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              bg="red.600"
              color="white"
              _hover={{ bg: "red.700" }}
              isDisabled={confirmText.trim() !== MENTOR_RESET_CONFIRM_TEXT}
              onClick={handleReset}
              isLoading={isResetting}
            >
              Hapus Semua
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageShell>
  );
};

export default MentorPage;
