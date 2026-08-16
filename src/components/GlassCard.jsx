// src/components/GlassCard.jsx
import { Box } from "@chakra-ui/react";

export const cardStyle = {
  w: "full",
  maxW: "540px",
  bg: "rgba(255,255,255,0.94)",
  backdropFilter: "auto",
  backdropBlur: "14px",
  borderRadius: "20px",
  boxShadow: "0 24px 70px rgba(3,10,32,0.5), 0 2px 10px rgba(0,0,0,0.15)",
  border: "1px solid",
  borderColor: "rgba(255,255,255,0.7)",
  position: "relative",
  overflow: "hidden",
};

const GlassCard = ({ children, ...rest }) => (
  <Box {...cardStyle} {...rest}>
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      h="4px"
      bgGradient="linear(to-r, #F97316, #fbbf24, #3b82f6)"
      zIndex={1}
    />
    {children}
  </Box>
);

export default GlassCard;
