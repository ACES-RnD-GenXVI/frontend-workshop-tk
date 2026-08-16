// src/components/ScanAnimation.jsx
import { Box } from "@chakra-ui/react";

const ScanAnimation = ({ active = true }) => {
  if (!active) return null;

  return (
    <Box position="relative" w="74px" h="74px" flexShrink={0}>
      <Box
        position="absolute"
        inset={0}
        borderRadius="full"
        border="2px solid"
        borderColor="#3b82f6"
        opacity="0.7"
        animation="pulseRing 1.6s ease-out infinite"
      />
      <Box
        position="absolute"
        inset={0}
        borderRadius="full"
        border="2px solid"
        borderColor="#3b82f6"
        opacity="0.5"
        animation="pulseRing 1.6s ease-out 0.55s infinite"
      />
      <Box position="absolute" inset="14px" borderRadius="full" overflow="hidden">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          w="52%"
          h="2px"
          bgGradient="linear(to-r, #3b82f6, transparent)"
          transformOrigin="left center"
          animation="radarSweep 1.8s linear infinite"
        />
      </Box>
      <Box
        position="absolute"
        inset="28px"
        borderRadius="full"
        bgGradient="radial(circle, #3b82f6 0%, #60a5fa 60%, transparent 100%)"
        boxShadow="0 0 16px rgba(59,130,246,0.8)"
      />
    </Box>
  );
};

export default ScanAnimation;
