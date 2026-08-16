// src/pages/RegisterPage.jsx
import { useState, useEffect, useRef } from "react";
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
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import ScanAnimation from "../components/ScanAnimation";
import { addAuthLog } from "../data/authLogs";
import bcrypt from "bcryptjs";
import { useAppBluetooth, ESP32_SERVICE_UUID, ESP32_CHAR_UUID } from "../components/BluetoothContext";
import { playBeepSound } from "../utils/sound";

import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const RegisterPage = ({ onNavigateToLogin }) => {
  const toast = useToast();
  const { connectedDevice, startNotifications } = useAppBluetooth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedUID, setDetectedUID] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [scanMessage, setScanMessage] = useState("Menunggu Perintah Binding...");
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleConnectSmartCard = async () => {
    // 1. Cek apakah ESP32 sudah terhubung
    if (!connectedDevice) {
      toast({
        title: "Hardware Terputus",
        description: "Silakan hubungkan Bluetooth ESP32 terlebih dahulu melalui scanner.",
        status: "warning",
        duration: 4000,
        position: "top",
      });
      return;
    }

    setIsConnecting(true);
    setDetectedUID(null);
    setScanMessage("Mengaktifkan mode scan pendaftaran...");

    try {
      // 2. Callback untuk menerima kiriman UID dari ESP32
      const handleRegisterNotification = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        const rawUID = decoder.decode(value).trim();

        if (rawUID) {
          playBeepSound("scan");
          setDetectedUID(rawUID);
          setScanMessage("Kartu Sukses Terikat!");
          setIsConnecting(false);

          toast({
            title: "RFID Terdeteksi",
            description: `Berhasil mendapatkan Card UID: ${rawUID}`,
            status: "success",
            duration: 3000,
            position: "top",
          });

          // Unsubscribe listener setelah berhasil scan 1 kartu
          if (unsubscribeRef.current) unsubscribeRef.current();
        }
      };

      // 3. Mulai mendengarkan data dari ESP32
      const unsub = await startNotifications(ESP32_SERVICE_UUID, ESP32_CHAR_UUID, handleRegisterNotification);
      unsubscribeRef.current = unsub;
      setScanMessage("Silakan tempelkan kartu RFID baru pada reader ESP32...");
    } catch (err) {
      playBeepSound("error");
      toast({
        title: "Gagal Mengaitkan",
        description: err.message,
        status: "error",
        position: "top",
      });
      setIsConnecting(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !detectedUID) {
      playBeepSound("error");
      toast({ title: "Formulir tidak lengkap", description: "Pastikan semua data diisi dan kartu sudah di-scan.", status: "warning", position: "top" });
      return;
    }

    setIsRegistering(true);

    try {
      const usersCollectionRef = collection(db, "users");

      const emailQuery = query(usersCollectionRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        playBeepSound("error");
        toast({ title: "Email sudah terdaftar.", status: "error", position: "top" });
        setIsRegistering(false);
        return;
      }

      const uidQuery = query(usersCollectionRef, where("cardUID", "==", detectedUID));
      const uidSnapshot = await getDocs(uidQuery);
      if (!uidSnapshot.empty) {
        playBeepSound("error");
        toast({ title: "Kartu RFID ini sudah terikat akun lain!", status: "error", position: "top" });
        setIsRegistering(false);
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = { name, email, password: hashedPassword, cardUID: detectedUID };
      await addDoc(usersCollectionRef, {
        ...newUser,
        createdAt: new Date().toISOString()
      });

      addAuthLog(`User baru didaftarkan: ${name}`);

      playBeepSound("success");
      toast({ title: "Registrasi Akun Sukses!", status: "success", position: "top" });
      onNavigateToLogin();
    } catch (error) {
      playBeepSound("error");
      toast({ title: "Firebase Error", description: error.message, status: "error", position: "top" });
    } finally {
      setIsRegistering(false);
    }
  };

  const inputStyles = {
    bg: "gray.50",
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "8px",
    fontSize: "sm",
    h: "44px",
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <PageShell>
      <GlassCard px={{ base: 7, sm: 10 }} py={8}>
        <Header />
        <Divider borderColor="gray.100" mb={6} />
        <Box mb={6} textAlign="center">
          <Text fontSize="21px" fontWeight="700" color="#0d2d6b">Registrasi Akun Baru</Text>
          <Text fontSize="13px" color="gray.500" mt={1}>Lengkapi profil dan kaitkan dengan kartu pintar RFID</Text>
        </Box>

        <VStack spacing={4}>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Nama Lengkap</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="John Doe" {...inputStyles} />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="john@example.com" {...inputStyles} />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" {...inputStyles} />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Koneksi Kartu RFID</FormLabel>
            <HStack w="full" spacing={3}>
              <Input readOnly placeholder={detectedUID ? `UID: ${detectedUID}` : "Belum ada kartu terikat"} value={detectedUID || ""} {...inputStyles} bg="gray.100" fontWeight="bold" fontFamily="mono" color={detectedUID ? "green.600" : "gray.500"} />
              <Button onClick={handleConnectSmartCard} isLoading={isConnecting} loadingText="Scanning..." bg="white" color="#F97316" border="1.5px solid" borderColor="#F97316" size="md" h="44px" px={5} fontSize="xs" fontWeight="700">
                Scan Kartu
              </Button>
            </HStack>
            {isConnecting && (
              <Box w="full" bg="gray.50" border="1px solid" borderColor="#bfdbfe" borderRadius="10px" px={4} py={3} mt={1}>
                <HStack spacing={3}>
                  <ScanAnimation />
                  <Text fontSize="xs" color="blue.600" fontWeight="600">{scanMessage}</Text>
                </HStack>
              </Box>
            )}
          </FormControl>

          <Button onClick={handleRegister} isLoading={isRegistering} bgGradient="linear(to-r, #0d2d6b, #1a3f8f)" color="white" _hover={{ bgGradient: "linear(to-r, #163a80, #2458c4)", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(13,45,107,0.35)" }} _active={{ transform: "scale(0.98)" }} transition="all 0.2s ease" w="full" h="44px" borderRadius="8px" fontSize="sm" fontWeight="600" mt={4}>
            Daftar Sekarang
          </Button>
        </VStack>

        <Flex align="center" justify="center" mt={6} gap={1}>
          <Text fontSize="sm" color="gray.400">Sudah punya akun?</Text>
          <Button variant="link" fontSize="sm" fontWeight="600" color="#0d2d6b" onClick={onNavigateToLogin}>Login</Button>
        </Flex>
      </GlassCard>
    </PageShell>
  );
};

export default RegisterPage;