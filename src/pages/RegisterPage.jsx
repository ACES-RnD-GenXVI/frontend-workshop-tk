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
import { addAuthLog } from "../data/authLogs";
import { useAppBluetooth, ESP32_SERVICE_UUID, ESP32_CHAR_UUID } from "../components/BluetoothContext";

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
    // Bagian Bluetooth dinonaktifkan sementara dan diganti dengan generator UID acak
    setIsConnecting(true);
    setDetectedUID(null);
    setScanMessage("Mengaktifkan mode scan simulator...");

    setTimeout(() => {
      // Membuat kombinasi UID acak sebanyak 4 segmen heksadesimal (Contoh: B3-F4-1A-9D)
      const hexChars = "0123456789ABCDEF";
      let mockUID = "";
      for (let i = 0; i < 4; i++) {
        mockUID += hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
        if (i < 3) mockUID += "-";
      }

      setDetectedUID(mockUID);
      setScanMessage("Kartu Sukses Terikat!");
      setIsConnecting(false);

      localStorage.setItem("lastMockUID", mockUID);

      toast({
        title: "Simulasi RFID Terdeteksi",
        description: `Berhasil mendapatkan Card UID simulator: ${mockUID}`,
        status: "success",
        duration: 3000,
        position: "top",
      });
    }, 1500);

    /* // CATATAN: Jika hardware ESP32 sudah siap, hapus baris simulasi di atas
    // dan kembalikan tanda komentar (uncomment) pada kode asli Web Bluetooth di bawah ini:

    if (!connectedDevice) {
      toast({
        title: "Hardware Terputus",
        description: "Silakan muat ulang halaman atau sambungkan ulang Bluetooth ESP32.",
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
      const handleRegisterNotification = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder("utf-8");
        const rawUID = decoder.decode(value).trim();

        if (rawUID) {
          setDetectedUID(rawUID);
          setScanMessage("Kartu Sukses Terikat!");
          setIsConnecting(false);
          if (unsubscribeRef.current) unsubscribeRef.current();
        }
      };

      const unsub = await startNotifications(ESP32_SERVICE_UUID, ESP32_CHAR_UUID, handleRegisterNotification);
      unsubscribeRef.current = unsub;
      setScanMessage("Silakan tempelkan kartu RFID baru pada reader ESP32...");
    } catch (err) {
      toast({
        title: "Gagal Mengaitkan",
        description: err.message,
        status: "error",
      });
      setIsConnecting(false);
    }
    */
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !detectedUID) {
      toast({ title: "Formulir tidak lengkap", description: "Pastikan semua data diisi dan kartu sudah di-scan.", status: "warning", position: "top" });
      return;
    }

    setIsRegistering(true);

    try {
      const usersCollectionRef = collection(db, "users");

      // 1. Validasi Cloud: Cek apakah email sudah terdaftar di Firestore
      const emailQuery = query(usersCollectionRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        toast({ title: "Email sudah terdaftar.", status: "error", position: "top" });
        setIsRegistering(false);
        return;
      }

      // 2. Validasi Cloud: Cek apakah Card UID sudah terikat dengan akun lain di Firestore
      const uidQuery = query(usersCollectionRef, where("cardUID", "==", detectedUID));
      const uidSnapshot = await getDocs(uidQuery);
      if (!uidSnapshot.empty) {
        toast({ title: "Kartu RFID ini sudah terikat akun lain!", status: "error", position: "top" });
        setIsRegistering(false);
        return;
      }

      // 3. Simpan data user baru secara permanen ke Firebase Firestore
      const newUser = { name, email, password, cardUID: detectedUID };
      await addDoc(usersCollectionRef, {
        ...newUser,
        createdAt: new Date().toISOString()
      });

      // Tetap sinkronkan ke local storage penunjang log lokal bawaan Anda
      const stored = localStorage.getItem("users");
      const users = stored ? JSON.parse(stored) : [];
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      addAuthLog(`User baru didaftarkan ke Cloud: ${name} (${detectedUID})`);

      toast({ title: "Registrasi Akun Sukses!", status: "success", position: "top" });
      onNavigateToLogin();
    } catch (error) {
      toast({
        title: "Firebase Error",
        description: error.message,
        status: "error",
        position: "top",
      });
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

  return (
    <Box minH="100vh" bg="#eaeff7" display="flex" alignItems="center" justifyContent="center" px={4} py={8}>
      <Box w="full" maxW="540px" bg="white" borderRadius="20px" boxShadow="0 12px 48px rgba(13,45,107,0.15)" px={{ base: 7, sm: 10 }} py={8}>
        <Header />
        <Divider borderColor="gray.100" mb={6} />
        <Box mb={6} textAlign="center">
          <Text fontSize="21px" fontWeight="700" color="#0d2d6b">Registrasi Akun Baru</Text>
          <Text fontSize="13px" color="gray.500" mt={1}>Lengkapi profil dan kaitkan dengan kartu pintar RFID</Text>
        </Box>

        <VStack spacing={4}>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Nama Lengkap</FormLabel>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" {...inputStyles} />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" {...inputStyles} />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" {...inputStyles} />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase">Koneksi Kartu RFID</FormLabel>
            <HStack w="full" spacing={3}>
              <Input readOnly placeholder={detectedUID ? `UID: ${detectedUID}` : "Belum ada kartu terikat"} value={detectedUID || ""} {...inputStyles} bg="gray.100" fontWeight="bold" fontFamily="mono" color={detectedUID ? "green.600" : "gray.500"} />
              <Button onClick={handleConnectSmartCard} isLoading={isConnecting} loadingText="Scanning..." bg="white" color="#F97316" border="1.5px solid" borderColor="#F97316" size="md" h="44px" px={5} fontSize="xs" fontWeight="700">
                Scan Kartu
              </Button>
            </HStack>
            {isConnecting && <Text fontSize="xs" color="blue.600" mt={1} fontWeight="500">{scanMessage}</Text>}
          </FormControl>

          <Button onClick={handleRegister} isLoading={isRegistering} bg="#0d2d6b" color="white" _hover={{ bg: "#1a3f8f" }} w="full" h="44px" borderRadius="8px" fontSize="sm" fontWeight="600" mt={4}>
            Daftar Sekarang
          </Button>
        </VStack>

        <Flex align="center" justify="center" mt={6} gap={1}>
          <Text fontSize="sm" color="gray.400">Sudah punya akun?</Text>
          <Button variant="link" fontSize="sm" fontWeight="600" color="#0d2d6b" onClick={onNavigateToLogin}>Login</Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default RegisterPage;