import { useWindowDimensions } from "react-native";

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;

  // Max width for content on tablets to prevent stretching
  const maxContentWidth = 800;
  const contentWidth = isTablet ? Math.min(width * 0.9, maxContentWidth) : width;

  return {
    width,
    height,
    isTablet,
    isDesktop,
    contentWidth,
    // Helper for grid layouts
    numColumns: isTablet ? 3 : 2,
    // Helper for horizontal padding
    horizontalPadding: isTablet ? (width - contentWidth) / 2 : 16,
  };
}
