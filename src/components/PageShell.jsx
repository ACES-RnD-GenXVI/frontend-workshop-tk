// src/components/PageShell.jsx
import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

const FIELD_ARC_RADII = [90, 150, 210, 270, 330, 390];

const PageShell = ({ children }) => {
  const glowRef = useRef(null);

  // Cursor glow: cahaya lembut yang mengikuti kursor (tanpa re-render)
  useEffect(() => {
    const onMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${e.clientX - 220}px, ${e.clientY - 220}px, 0)`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
      bgGradient="linear(to-br, #081436, #0d2d6b 55%, #16356e)"
      bgAttachment="fixed"
    >
      {/* Cursor spotlight */}
      <Box
        ref={glowRef}
        position="fixed"
        top={0}
        left={0}
        w="440px"
        h="440px"
        borderRadius="full"
        pointerEvents="none"
        bg="radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(249,115,22,0.09) 45%, transparent 70%)"
        mixBlendMode="screen"
        style={{
          transform: "translate3d(-600px,-600px,0)",
          willChange: "transform",
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* RFID antenna field */}
      <Box
        position="absolute"
        bottom="-12%"
        left="50%"
        transform="translateX(-50%)"
        w="min(900px, 140vw)"
        opacity="0.55"
        pointerEvents="none"
      >
        <svg viewBox="0 0 900 620" fill="none" preserveAspectRatio="xMidYMax meet">
          <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round">
            {FIELD_ARC_RADII.map((r, i) => (
              <ellipse
                key={i}
                cx={450}
                cy={470}
                rx={r}
                ry={r * 0.62}
                opacity={0.28 - i * 0.028}
                style={{
                  animation: `fieldPulse 7s ease-in-out ${i * 0.55}s infinite`,
                }}
              />
            ))}
          </g>
          <path
            d="M450 470 L450 210"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 10"
            style={{ animation: "fieldDash 9s linear infinite" }}
          />
        </svg>
      </Box>

      {/* Glow orbs */}
      <Box
        position="absolute"
        top="-140px"
        left="-120px"
        w="380px"
        h="380px"
        borderRadius="full"
        bg="#F97316"
        opacity="0.14"
        filter="blur(90px)"
        animation="orbFloat 14s ease-in-out infinite"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-160px"
        right="-140px"
        w="440px"
        h="440px"
        borderRadius="full"
        bg="#3b82f6"
        opacity="0.18"
        filter="blur(100px)"
        animation="orbFloat 18s ease-in-out infinite reverse"
        pointerEvents="none"
      />
      {children}
    </Box>
  );
};

export default PageShell;
