# Tour Guide Implementation

## Overview
This tour guide implementation uses the `rn-tourguide` package to provide a guided experience for first-time users of the PokeNiho app.

## Features

### 1. Welcome Modal
- Triggers when `isFirstTimeLogin` is `true` in the global state
- Displays a personalized welcome message with username and Pokémon name
- Uses a beautiful gradient background matching the app's design [[memory:2489698]]

### 2. Tour Steps
The tour highlights three key areas:

#### Step 1: User Profile Header
- **Zone**: 1
- **Message**: "Here's your progress. Complete the lessons to level up!"
- **Component**: `UserProfileHeaderAtomic`

#### Step 2: Partner Pokémon Display
- **Zone**: 2
- **Message**: "Take care of your partner Pokémon and evolve together!"
- **Component**: `PokemonDisplay`

#### Step 3: Learn Button
- **Zone**: 3
- **Message**: "Start your journey here!"
- **Component**: Learn button in `MainNavigation`

### 3. State Management
- **Trigger**: `isFirstTimeLogin: true` in user store
- **Completion**: Automatically sets `isFirstTimeLogin: false` when tour ends
- **Persistence**: Uses Zustand store for state management

## Usage

### Basic Implementation
```tsx
import TourGuide from '@components/ui/TourGuide';

export default function HomeScreen() {
  return (
    <TourGuide>
      {/* Your existing content */}
    </TourGuide>
  );
}
```

### Adding Tour Steps to Components
```tsx
import { TourStep } from '@components/ui/TourGuide';

export default function MyComponent() {
  return (
    <TourStep
      name="MyComponent"
      text="This is what this component does!"
      zone={1}
    >
      {/* Your component content */}
    </TourStep>
  );
}
```

## Configuration

### Tour Guide Provider Settings
- **Overlay Color**: Semi-transparent black overlay
- **Border Radius**: 16px for rounded corners
- **Mask Offset**: 8px spacing around highlighted areas
- **Tooltip Style**: Custom styling with padding and border radius

### Global State Integration
The tour guide integrates with the user store:
- Reads `isFirstTimeLogin`, `starterId`, and `email`
- Automatically extracts username from email
- Gets Pokémon name from starterId
- Updates `isFirstTimeLogin` to false on completion

## Files Modified
1. `src/components/ui/TourGuide.tsx` - Main tour guide component
2. `src/components/ui/WelcomeModal.tsx` - Welcome modal component
3. `src/components/Organism/UserProfileHeader.tsx` - Added tour step
4. `src/components/molecules/PokemonDisplay.tsx` - Added tour step
5. `src/components/MainNavigation.tsx` - Added tour step to Learn button
6. `src/components/layouts/HomeLayout.tsx` - Added Pokémon display section
7. `src/app/(tabs)/home.tsx` - Wrapped with TourGuide provider

## Dependencies
- `rn-tourguide`: ^3.3.2 - Tour guide library
- `expo-linear-gradient`: For gradient backgrounds
- `zustand`: For state management

## Testing
To test the tour guide:
1. Set `isFirstTimeLogin: true` in the user store
2. Navigate to the home screen
3. The welcome modal should appear
4. After closing the modal, the tour should start automatically
5. Complete all three steps to end the tour
6. Verify that `isFirstTimeLogin` is set to `false`
