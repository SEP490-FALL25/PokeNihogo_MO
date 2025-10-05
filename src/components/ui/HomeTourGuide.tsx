import React, { createContext, useContext, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  AttachStep,
  SpotlightTourProvider,
  TourStep,
  useSpotlightTour,
} from "react-native-spotlight-tour";
import { ThemedText } from "../ThemedText";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Animation types available for tour steps
 * @type AnimationType
 */
type AnimationType = "bounce" | "slide" | "fade";

/**
 * Tour step animations configuration
 *
 * 🎨 EASY ANIMATION TESTING - Change these to test different effects:
 * Options: ["bounce", "slide", "fade"]
 *
 * Examples:
 * - ["bounce", "bounce", "bounce"] - All bounce
 * - ["slide", "slide", "slide"] - All slide
 * - ["fade", "fade", "fade"] - All fade
 * - ["bounce", "slide", "fade"] - Mixed animations
 */
const STEP_ANIMATIONS: AnimationType[] = ["slide", "slide", "slide"];

/**
 * Tour configuration constants
 */
const TOUR_CONFIG = {
  OVERLAY_COLOR: "rgba(0, 0, 0, 0.8)",
  OVERLAY_OPACITY: 0.8,
  START_DELAY: 300,
  SCROLL_DELAY: 500,
  STEP_TRANSITION_DELAY: 100,
  STEP_PROCEED_DELAY: 300,
} as const;

// ============================================================================
// CONTEXT AND HOOKS
// ============================================================================

/**
 * Auto-scroll Context for tour navigation
 * Provides scroll functionality to tour steps for smooth navigation
 */
const ScrollContext = createContext<{ scrollTo: (y: number) => void } | null>(
  null
);

/**
 * Hook to access scroll context
 * @returns Scroll context with scrollTo function
 * @throws Warning if used outside ScrollProvider
 */
export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    console.warn("useScrollContext must be used within ScrollProvider");
    return { scrollTo: () => {} };
  }
  return context;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for HomeTourGuide component
 * @interface HomeTourGuideProps
 */
interface HomeTourGuideProps {
  /** Child components to wrap with tour guide */
  children: React.ReactNode;
  /** Callback when tour is completed */
  onTourComplete: () => void;
  /** Whether to start the tour automatically */
  shouldStartTour: boolean;
  /** Optional scroll function for auto-scrolling during tour */
  scrollTo?: (y: number) => void;
}

/**
 * Props for TourStep wrapper component
 * @interface TourStepProps
 */
interface TourStepProps {
  /** Child components to attach tour step to */
  children: React.ReactNode;
  /** Index of the tour step (0-based) */
  stepIndex: number;
  /** Title displayed in tour step */
  title: string;
  /** Description displayed in tour step */
  description: string;
  /** Shape of the tour step highlight (optional) */
  shape?: "circle" | "rectangle";
  /** Padding around the highlighted element (optional) */
  padding?: number;
  /** Whether to adapt shape to content (optional) */
  adaptiveShape?: boolean;
}

// ============================================================================
// TOUR STEP WRAPPER COMPONENT
// ============================================================================

/**
 * TourStepWrapper Component
 *
 * Wraps child components with tour step functionality.
 * Uses AttachStep to connect components to the tour system.
 *
 * @param props - TourStepProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <TourStep
 *   stepIndex={0}
 *   title="Welcome"
 *   description="This is your first step"
 * >
 *   <MyComponent />
 * </TourStep>
 * ```
 */
const TourStepWrapper = React.memo(function TourStepWrapper({
  children,
  stepIndex,
  title,
  description,
  shape = "rectangle",
  padding = 12,
  adaptiveShape = true,
}: TourStepProps) {
  return (
    <AttachStep
      index={stepIndex}
      fill={true} // Fill to match the wrapped component's dimensions
      style={styles.invisibleWrapper} // Invisible wrapper to not affect layout
    >
      <View style={styles.invisibleWrapper}>{children}</View>
    </AttachStep>
  );
});

// ============================================================================
// TOUR STEP CONTENT COMPONENTS
// ============================================================================

/**
 * Tour Step 1: Progress Section
 *
 * First step of the tour highlighting user progress.
 * Includes auto-scroll to next step functionality.
 */
const TourStep1 = React.memo(function TourStep1({
  next,
}: {
  next: () => void;
}) {
  const { scrollTo } = useScrollContext();

  /**
   * Handle next button press with auto-scroll
   */
  const handleNext = () => {
    // Auto-scroll to next step before proceeding
    setTimeout(() => scrollTo(200), TOUR_CONFIG.STEP_TRANSITION_DELAY);
    setTimeout(() => next(), TOUR_CONFIG.STEP_PROCEED_DELAY);
  };

  return (
    <View style={styles.tourContent}>
      <ThemedText style={styles.tourTitle}>
        Here&apos;s your progress
      </ThemedText>
      <ThemedText style={styles.tourDescription}>
        Complete the lessons to level up!
      </ThemedText>
      <TouchableOpacity style={styles.tourButton} onPress={handleNext}>
        <ThemedText style={styles.tourButtonText}>Next</ThemedText>
      </TouchableOpacity>
    </View>
  );
});

/**
 * Tour Step 2: Partner Pokemon Section
 *
 * Second step highlighting the user's partner Pokemon.
 * Includes navigation to previous and next steps with auto-scroll.
 */
const TourStep2 = React.memo(function TourStep2({
  previous,
  next,
}: {
  previous: () => void;
  next: () => void;
}) {
  const { scrollTo } = useScrollContext();

  /**
   * Handle previous button press with auto-scroll
   */
  const handlePrevious = () => {
    // Auto-scroll back to previous step
    setTimeout(() => scrollTo(0), TOUR_CONFIG.STEP_TRANSITION_DELAY);
    setTimeout(() => previous(), TOUR_CONFIG.STEP_PROCEED_DELAY);
  };

  /**
   * Handle next button press with auto-scroll
   */
  const handleNext = () => {
    // Auto-scroll to next step
    setTimeout(() => scrollTo(400), TOUR_CONFIG.STEP_TRANSITION_DELAY);
    setTimeout(() => next(), TOUR_CONFIG.STEP_PROCEED_DELAY);
  };

  return (
    <View style={styles.tourContent}>
      <ThemedText style={styles.tourTitle}>Your partner Pokémon</ThemedText>
      <ThemedText style={styles.tourDescription}>
        Take care of your partner Pokémon and evolve together!
      </ThemedText>
      <View style={styles.tourButtons}>
        <TouchableOpacity style={styles.tourButton} onPress={handlePrevious}>
          <ThemedText style={styles.tourButtonText}>Previous</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tourButton} onPress={handleNext}>
          <ThemedText style={styles.tourButtonText}>Next</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/**
 * Tour Step 3: Learning Journey Section
 *
 * Final step of the tour highlighting the learning journey.
 * Includes navigation to previous step and tour completion.
 */
const TourStep3 = React.memo(function TourStep3({
  previous,
  stop,
}: {
  previous: () => void;
  stop: () => void;
}) {
  const { scrollTo } = useScrollContext();

  /**
   * Handle previous button press with auto-scroll
   */
  const handlePrevious = () => {
    // Auto-scroll back to previous step
    setTimeout(() => scrollTo(200), TOUR_CONFIG.STEP_TRANSITION_DELAY);
    setTimeout(() => previous(), TOUR_CONFIG.STEP_PROCEED_DELAY);
  };

  return (
    <View style={styles.tourContent}>
      <ThemedText style={styles.tourTitle}>Start your journey</ThemedText>
      <ThemedText style={styles.tourDescription}>
        Start your journey here!
      </ThemedText>
      <View style={styles.tourButtons}>
        <TouchableOpacity style={styles.tourButton} onPress={handlePrevious}>
          <ThemedText style={styles.tourButtonText}>Previous</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tourButton} onPress={stop}>
          <ThemedText style={styles.tourButtonText}>Finish</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ============================================================================
// TOUR CONFIGURATION
// ============================================================================

/**
 * Tour steps configuration with animations and auto-scroll
 *
 * Each step includes:
 * - Placement: Where the tour content appears relative to highlighted element
 * - Shape: Visual shape of the highlight (rectangle/circle)
 * - Motion: Animation type for step transitions
 * - Render: Component to display for each step
 */
const tourSteps: TourStep[] = [
  {
    placement: "bottom",
    shape: { type: "rectangle" as const, padding: 12 },
    flip: true,
    shift: { padding: 16 },
    offset: 8,
    motion: STEP_ANIMATIONS[0] as "bounce" | "slide" | "fade", // Step 1 animation
    render: ({ next }) => <TourStep1 next={next} />,
  },
  {
    placement: "bottom",
    shape: { type: "rectangle" as const, padding: 12 },
    flip: true,
    shift: { padding: 16 },
    offset: 8,
    motion: STEP_ANIMATIONS[1] as "bounce" | "slide" | "fade", // Step 2 animation
    render: ({ previous, next }) => (
      <TourStep2 previous={previous} next={next} />
    ),
  },
  {
    placement: "top",
    shape: { type: "rectangle" as const, padding: 12 },
    flip: true,
    shift: { padding: 16 },
    offset: 8,
    motion: STEP_ANIMATIONS[2] as "bounce" | "slide" | "fade", // Step 3 animation
    render: ({ previous, stop }) => (
      <TourStep3 previous={previous} stop={stop} />
    ),
  },
];

// ============================================================================
// TOUR CONTROLLER COMPONENT
// ============================================================================

/**
 * TourController Component
 *
 * Controls the tour lifecycle and auto-scroll functionality.
 * Handles tour start timing and initial scroll positioning.
 *
 * @param props - Tour controller props
 * @returns null (invisible component)
 */
const TourController = React.memo(function TourController({
  onTourComplete,
  shouldStartTour,
}: {
  onTourComplete: () => void;
  shouldStartTour: boolean;
}) {
  const { start } = useSpotlightTour();
  const { scrollTo } = useScrollContext();

  /**
   * Effect to handle tour start with proper timing
   */
  useEffect(() => {
    if (shouldStartTour) {
      // Start tour after configured delay for better performance
      const timer = setTimeout(() => {
        start();
        // Auto-scroll to first step
        setTimeout(() => {
          scrollTo(0);
        }, TOUR_CONFIG.SCROLL_DELAY);
      }, TOUR_CONFIG.START_DELAY);
      return () => clearTimeout(timer);
    }
  }, [shouldStartTour, start, scrollTo]);

  return null;
});

// ============================================================================
// MAIN TOUR GUIDE COMPONENT
// ============================================================================

/**
 * HomeTourGuide Component
 *
 * Main tour guide wrapper that provides tour functionality to child components.
 * Features auto-scroll, configurable animations, and smooth step transitions.
 *
 * @param props - HomeTourGuideProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <HomeTourGuide
 *   onTourComplete={() => console.log('Tour completed')}
 *   shouldStartTour={true}
 *   scrollTo={(y) => scrollViewRef.current?.scrollTo({ y })}
 * >
 *   <YourContent />
 * </HomeTourGuide>
 * ```
 */
const HomeTourGuide = React.memo(function HomeTourGuide({
  children,
  onTourComplete,
  shouldStartTour,
  scrollTo,
}: HomeTourGuideProps) {
  /**
   * Default scroll function when no scrollTo prop is provided
   */
  const defaultScrollTo = (y: number) => {
    // Default scroll function - no action needed
  };

  const scrollFunction = scrollTo || defaultScrollTo;

  return (
    <ScrollContext.Provider value={{ scrollTo: scrollFunction }}>
      <SpotlightTourProvider
        steps={tourSteps}
        overlayColor={TOUR_CONFIG.OVERLAY_COLOR}
        overlayOpacity={TOUR_CONFIG.OVERLAY_OPACITY}
        onStop={onTourComplete}
        // Optimize tour performance with bounce/slide animations
        motion="bounce"
        shape={{ type: "rectangle", padding: 8 }}
      >
        {children}
        <TourController
          onTourComplete={onTourComplete}
          shouldStartTour={shouldStartTour}
        />
      </SpotlightTourProvider>
    </ScrollContext.Provider>
  );
});

// ============================================================================
// EXPORTS
// ============================================================================

export default HomeTourGuide;
export { TourStepWrapper as TourStep };

// ============================================================================
// STYLES
// ============================================================================

/**
 * Styles for HomeTourGuide components
 *
 * Organized by component for better maintainability:
 * - Wrapper styles (invisible, overlay)
 * - Tour content styles (modal, buttons, text)
 * - Performance optimizations (fixed widths, shadows)
 */
const styles = StyleSheet.create({
  // Wrapper styles
  invisibleWrapper: {
    // Completely invisible wrapper that doesn't affect layout
    // No styles that would interfere with the wrapped component
  },
  tourZone: {
    // Optimized styles for better performance
    alignSelf: "flex-start",
  },
  tourOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  // Tour content styles
  tourContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    width: 300, // Fixed width for consistent performance
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  tourDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },

  // Button styles
  tourButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  tourButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  tourButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
