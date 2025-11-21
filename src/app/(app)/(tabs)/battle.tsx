import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import ModalBattleAccept from "@components/battle/modal-accept.battle";
import ModalBattleHistory from "@components/battle/modal-battleHistory";
import ModalFirstTimeUser from "@components/battle/modal-first-time-user";
import ModalLeaderboard from "@components/battle/modal-leaderboard";
import ModalNewSeasonInfo from "@components/battle/modal-new-season-info";
import ModalRewardLeaderboard from "@components/battle/modal-rewardLeaderboard";
import ModalSeasonEnded from "@components/battle/modal-season-ended";
import SeasonInfo from "@components/battle/season-info.battle";
import StatsBattle from "@components/battle/stats.battle";
import { HapticPressable } from "@components/HapticPressable";
import GlowingRingEffect from "@components/molecules/GlowingRingEffect";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import TypingText from "@components/ui/TypingText";
import { getSocket } from "@configs/socket";
import { BATTLE_STATUS } from "@constants/battle.enum";
import useAuth from "@hooks/useAuth";
import { useJoinNewSeason, useMatchTracking } from "@hooks/useBattle";
import { useUserStatsSeason } from "@hooks/useSeason";
import { IBattleMatchFound, IBattleMatchStatusUpdate, IBattleMatchTrackingResponse } from "@models/battle/battle.response";
import { ROUTES } from "@routes/routes";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { Crown, History, Info, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Animated, Easing, ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";


export default function BattleLobbyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queueMessagesTranslation = t("battle.lobby.queue_messages", { returnObjects: true });
  const queueMessages =
    Array.isArray(queueMessagesTranslation) && queueMessagesTranslation.length > 0
      ? (queueMessagesTranslation as string[])
      : [t("battle.lobby.queue_status.searching")];
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { user } = useAuth();

  const [showAcceptModal, setShowAcceptModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Season state management
  const { data: seasonData, responseType, isLoading: isLoadingSeason } = useUserStatsSeason();
  const [showSeasonEndedModal, setShowSeasonEndedModal] = useState(false);
  const [showNewSeasonModal, setShowNewSeasonModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [newSeasonInfo, setNewSeasonInfo] = useState<any>(null);
  const joinNewSeasonMutation = useJoinNewSeason();
  const queryClient = useQueryClient();

  // Match tracking - check for active matches when screen is focused
  // Enable polling when season is active to check for match status changes
  const { data: matchTrackingData, refetch: refetchMatchTracking, isLoading: isLoadingMatchTracking } = useMatchTracking(
    responseType === 'ACTIVE', // Only enable when season is active
    responseType === 'ACTIVE' ? 5000 : 0 // Poll every 5 seconds when season is active
  );


  // Track if we've already checked match tracking to avoid multiple navigations
  const hasCheckedMatchTracking = useRef(false);
  // Track the last processed matchId and status to avoid reprocessing the same match with same status
  const lastProcessedMatchId = useRef<number | null>(null);
  const lastProcessedStatus = useRef<string | null>(null);

  /**
   * Shimmer effect
   */
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  //------------------------End------------------------//


  /**
   * Pulse effect
   */
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  //------------------------End------------------------//


  /**
   * Socket reference
   */
  const socketRef = useRef<Socket | null>(null);
  const [inQueue, setInQueue] = useState<boolean>(false);

  const handleStartRanked = async () => {
    // Don't allow queueing if season is not active
    if (responseType !== 'ACTIVE') {
      return;
    }

    console.log("[QUEUE] Start button pressed");
    setInQueue(true);
    setGlobalInQueue(true); // Update global store
    try {
      await battleService.matchQueue();
      // ✅ Emit join-searching-room after successful queue (as per index.html)
      if (socketRef.current) {
        socketRef.current.emit("join-searching-room", {}, (ack: any) => {
          console.log("[QUEUE] join-searching-room ack:", ack);
        });
        console.log("[QUEUE] Emitted join-searching-room");
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), t("battle.lobby.alerts.queue_error_message"));
      console.log("[QUEUE] startQueue failed:", error?.response?.data?.message);
      setInQueue(false);
      setGlobalInQueue(false); // Update global store
    }
  };
  //------------------------End------------------------//


  /**
   * Handle open leaderboard
   */
  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
  };

  const handleViewTopRewards = () => {
    setShowRewards(true);
  };

  const handleViewRankInfo = () => {
    Alert.alert(
      t("battle.lobby.alerts.rank_info_title"),
      t("battle.lobby.alerts.rank_info_message"),
    );
  };
  //------------------------End------------------------//

  /**
   * Handle season ended modal continue
   */
  const handleSeasonEndedContinue = () => {
    // Modal will handle showing rewards internally
  };

  /**
   * Handle claim reward complete
   */
  const handleClaimRewardComplete = async () => {
    setShowSeasonEndedModal(false);

    // After claiming, call joinNewSeason
    try {
      const response = await joinNewSeasonMutation.mutateAsync();
      const seasonNowInfo = response?.data?.data?.seasonNowInfo;
      if (seasonNowInfo) {
        setNewSeasonInfo(seasonNowInfo);
        setShowNewSeasonModal(true);
      } else {
        // Refresh season data
        queryClient.invalidateQueries({ queryKey: ['user-stats-season'] });
      }
    } catch (error: any) {
      console.error("Failed to join new season:", error);
      Alert.alert(t("common.error"), error?.response?.data?.message || t("common.error") || "An error occurred");
      // Refresh anyway
      queryClient.invalidateQueries({ queryKey: ['user-stats-season'] });
    }
  };

  /**
   * Handle first time user join complete
   */
  const handleFirstTimeJoinComplete = (newSeasonInfo: any) => {
    setShowFirstTimeModal(false);
    setNewSeasonInfo(newSeasonInfo);
    setShowNewSeasonModal(true);
  };

  /**
   * Handle new season modal close
   */
  const handleNewSeasonModalClose = () => {
    setShowNewSeasonModal(false);
    setNewSeasonInfo(null);
    // Refresh season data
    queryClient.invalidateQueries({ queryKey: ['user-stats-season'] });
  };
  //------------------------End------------------------//



  /**
   * Matched player
   * - Handle accept match
   * - Handle reject match
   * - Handle cancel queue
   */
  const [matchedPlayer, setMatchedPlayer] = useState<IBattleMatchFound | null>(null);

  const handleCancelQueue = async () => {
    setInQueue(false);
    setGlobalInQueue(false); // Update global store
    await battleService.cancelQueue();
  };
  //------------------------End------------------------//


  /**
   * Handle matching event
   * Note: This screen also updates the global matching store so notifications appear on all tabs
   */
  const [statusMatch, setStatusMatch] = useState<"reject" | "accept" | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    setIsInQueue: setGlobalInQueue,
    showMatchFoundModal: showGlobalMatchFound,
    hideMatchFoundModal: hideGlobalMatchFound,
  } = useMatchingStore();
  const clearLastMatchResult = useMatchingStore((s) => (s as any).clearLastMatchResult);
  const setLastMatchResult = useMatchingStore((s) => (s as any).setLastMatchResult);

  // Reset match-related state when component mounts (e.g., returning from result screen)
  useEffect(() => {
    setStatusMatch(null);
    setShowAcceptModal(false);
    setMatchedPlayer(null);
  }, []);

  /**
   * Handle navigation based on match tracking data
   * This function processes the match tracking data and navigates accordingly
   */
  const handleMatchTrackingData = useCallback((data: IBattleMatchTrackingResponse | undefined, forceProcess: boolean = false) => {
    if (!data) {
      console.log("[MATCH_TRACKING] No data to process");
      return;
    }

    const currentMatchId = data.matchId || data.match?.id;
    const currentStatus = data.type;

    // Skip if we've already processed this match with the same status, unless forced
    const isSameMatchAndStatus = currentMatchId &&
      lastProcessedMatchId.current === currentMatchId &&
      lastProcessedStatus.current === currentStatus;

    if (!forceProcess && isSameMatchAndStatus && data.type !== BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH) {
      console.log("[MATCH_TRACKING] Already processed matchId:", currentMatchId, "status:", currentStatus, "- skipping");
      return;
    }

    console.log("[MATCH_TRACKING] Processing status:", currentStatus, "matchId:", currentMatchId, "force:", forceProcess, "lastStatus:", lastProcessedStatus.current);

    // Update last processed matchId and status
    if (currentMatchId) {
      lastProcessedMatchId.current = currentMatchId;
      lastProcessedStatus.current = currentStatus;
    } else if (data.type === BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH) {
      lastProcessedMatchId.current = null;
      lastProcessedStatus.current = null;
    }

    // Handle navigation based on match status
    switch (data.type) {
      case BATTLE_STATUS.MATCH_TRACKING_STATUS.MATCH_FOUND:
        // Show accept modal if match is found and not yet accepted
        if (data.match && data.opponent && data.participant && !data.participant.hasAccepted) {
          const matchId = data.matchId || data.match.id;

          const matchFoundPayload: IBattleMatchFound = {
            type: BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND,
            matchId: matchId,
            match: {
              id: data.match.id,
              status: data.match.status,
              createdAt: data.match.createdAt,
              endTime: data.match.endTime || "",
            },
            opponent: {
              id: data.opponent.id,
              name: data.opponent.name,
              avatar: data.opponent.avatar || undefined,
            },
            participant: {
              id: data.participant.id,
              matchId: data.participant.matchId,
              hasAccepted: data.participant.hasAccepted,
              userId: data.participant.userId,
            },
          };

          // Update UI state
          setInQueue(false);
          setGlobalInQueue(false);
          setMatchedPlayer(matchFoundPayload);
          setShowAcceptModal(true);
          showGlobalMatchFound(matchFoundPayload, String(matchId));

          // Note: Don't join rooms here, wait for MATCH_STATUS_UPDATE with IN_PROGRESS
          // Rooms will be joined when status becomes IN_PROGRESS (as per index.html flow)
        }
        break;

      case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_SELECTING_POKEMON:
      case BATTLE_STATUS.MATCH_TRACKING_STATUS.BETWEEN_ROUNDS:
        // Navigate to pick pokemon screen immediately
        const pickPokemonMatchId = data.matchId || data.match?.id;

        if (!pickPokemonMatchId) {
          console.log("[MATCH_TRACKING] No matchId for pick pokemon navigation");
          break;
        }

        console.log("[MATCH_TRACKING] 🎯 Navigating to pick pokemon, matchId:", pickPokemonMatchId, "status:", data.type);

        // Join matching rooms before navigating to ensure socket connection is established
        if (socketRef.current && pickPokemonMatchId) {
          socketRef.current.emit("join-matching-room", { matchId: pickPokemonMatchId });
          socketRef.current.emit("join-user-match-room", { matchId: pickPokemonMatchId });
          console.log("[MATCH_TRACKING] Joined matching-room and user-match-room for pick-pokemon, matchId:", pickPokemonMatchId);
        }

        setInQueue(false);
        setGlobalInQueue(false);
        hideGlobalMatchFound();
        queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
        queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });

        // Use replace to prevent back navigation to battle screen
        // This is critical when user kills app and comes back - should go to pick pokemon
        router.replace({
          pathname: ROUTES.APP.PICK_POKEMON,
          params: {
            matchId: String(pickPokemonMatchId),
          },
        });
        break;

      case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_IN_PROGRESS:
      case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_STARTING:
        // Navigate to arena screen immediately
        const arenaMatchId = data.matchId || data.match?.id;

        if (!arenaMatchId) {
          console.log("[MATCH_TRACKING] No matchId for arena navigation");
          break;
        }

        // roundNumber is required for arena, but if not provided, we still navigate
        // Arena screen will handle missing roundNumber
        const roundNumber = data.roundNumber || "ONE"; // Default to ONE if not provided

        console.log("[MATCH_TRACKING] 🎯 Navigating to arena, matchId:", arenaMatchId, "round:", roundNumber, "status:", data.type);

        // Join matching rooms before navigating to ensure socket connection is established
        if (socketRef.current && arenaMatchId) {
          socketRef.current.emit("join-matching-room", { matchId: arenaMatchId });
          socketRef.current.emit("join-user-match-room", { matchId: arenaMatchId });
          console.log("[MATCH_TRACKING] Joined matching-room and user-match-room for arena, matchId:", arenaMatchId);
        }

        setInQueue(false);
        setGlobalInQueue(false);
        hideGlobalMatchFound();
        queryClient.invalidateQueries({ queryKey: ['list-match-round'] });

        // Use replace to prevent back navigation to battle screen
        // This is critical when user kills app and comes back - should go to arena
        router.replace({
          pathname: ROUTES.APP.ARENA,
          params: {
            matchId: String(arenaMatchId),
            roundNumber: roundNumber,
          },
        });
        break;

      case BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH:
        // No active match, ensure UI is in correct state
        setInQueue(false);
        setGlobalInQueue(false);
        setShowAcceptModal(false);
        setMatchedPlayer(null);
        setStatusMatch(null);
        hideGlobalMatchFound();
        break;
    }
  }, [router, setGlobalInQueue, showGlobalMatchFound, hideGlobalMatchFound, queryClient, socketRef]);

  /**
   * Check match tracking and navigate if needed
   * Uses matchTrackingData from hook directly
   */
  const checkMatchTrackingAndNavigate = useCallback(() => {
    // Prevent multiple simultaneous checks
    if (hasCheckedMatchTracking.current) {
      console.log("[MATCH_TRACKING] Already checking, skipping...");
      return;
    }

    // Only check match tracking if season is active and loaded
    if (responseType !== 'ACTIVE' || isLoadingSeason || isLoadingMatchTracking) {
      console.log("[MATCH_TRACKING] Skipping - responseType:", responseType, "isLoadingSeason:", isLoadingSeason, "isLoadingMatchTracking:", isLoadingMatchTracking);
      return;
    }

    // Use existing data from hook (hook will refetch on mount/focus due to refetchOnMount: "always")
    const data = matchTrackingData as IBattleMatchTrackingResponse | undefined;

    if (data) {
      console.log("[MATCH_TRACKING] Using data from hook");
      hasCheckedMatchTracking.current = true;
      handleMatchTrackingData(data, false);
      // Reset flag after processing
      setTimeout(() => {
        hasCheckedMatchTracking.current = false;
      }, 1000);
    } else {
      console.log("[MATCH_TRACKING] No data yet, will wait for hook to fetch");
    }
  }, [responseType, isLoadingSeason, isLoadingMatchTracking, matchTrackingData, handleMatchTrackingData]);

  // Track if we've initialized the check on season active
  const hasInitializedSeasonCheck = useRef(false);
  // Track if battle screen is currently focused
  const isBattleScreenFocused = useRef(false);

  /**
   * Check match tracking when season becomes active and battle screen is focused
   * This handles when app is opened from kill state and user is on battle screen
   * This is the main handler for when season loads after user clicks battle tab
   */
  useEffect(() => {
    console.log("[MATCH_TRACKING] useEffect trigger - isLoadingSeason:", isLoadingSeason, "responseType:", responseType, "isBattleFocused:", isBattleScreenFocused.current, "hasChecked:", hasCheckedMatchTracking.current);

    // When season becomes active and loaded, and battle screen is focused, check match tracking
    // This is critical for app kill scenario: user opens app at home, clicks battle, season loads after
    if (!isLoadingSeason && responseType === 'ACTIVE' && !isLoadingMatchTracking && isBattleScreenFocused.current) {
      console.log("[MATCH_TRACKING] Conditions met: Season active + battle focused, checking match status...");

      // Reset flag when season becomes active to ensure we check
      // This is important for app kill scenario
      if (hasCheckedMatchTracking.current) {
        console.log("[MATCH_TRACKING] Resetting hasChecked flag to allow check on season active");
        hasCheckedMatchTracking.current = false;
      }

      const checkMatchStatus = async () => {
        // Double check to prevent race conditions
        if (hasCheckedMatchTracking.current) {
          console.log("[MATCH_TRACKING] Already checking, skipping...");
          return;
        }

        try {
          hasCheckedMatchTracking.current = true;
          console.log("[MATCH_TRACKING] Refetching match status on season ready...");

          const trackingResult = await refetchMatchTracking();
          const data = trackingResult.data?.data?.data as IBattleMatchTrackingResponse | undefined;

          if (data) {
            console.log("[MATCH_TRACKING] Got data on season ready:", data.type, "matchId:", data.matchId || data.match?.id);
            // Force process to ensure navigation happens
            handleMatchTrackingData(data, true); // Force process
          } else {
            console.log("[MATCH_TRACKING] No match data on season ready");
          }

          setTimeout(() => {
            hasCheckedMatchTracking.current = false;
          }, 1000);
        } catch (error) {
          console.error("[MATCH_TRACKING] Error:", error);
          hasCheckedMatchTracking.current = false;
        }
      };

      // Small delay to ensure everything is ready
      const timer = setTimeout(checkMatchStatus, 300);
      return () => clearTimeout(timer);
    }

    // Reset initialization flag when season becomes inactive
    if (responseType !== 'ACTIVE') {
      hasInitializedSeasonCheck.current = false;
    }
  }, [isLoadingSeason, responseType, isLoadingMatchTracking, refetchMatchTracking, handleMatchTrackingData]);

  /**
   * Watch for matchTrackingData changes and process when data arrives
   * This handles when user is already in battle screen and match status changes
   * This is critical for: user in battle lobby, match starts, should auto-navigate
   */
  useEffect(() => {
    // Only process if we have data, season is active, and not currently loading
    // This handles when user is already in battle screen (not just on focus)
    if (matchTrackingData && responseType === 'ACTIVE' && !isLoadingSeason && !isLoadingMatchTracking) {
      const data = matchTrackingData as IBattleMatchTrackingResponse;
      const currentMatchId = data.matchId || data.match?.id;
      const currentStatus = data.type;

      console.log("[MATCH_TRACKING] Data changed:", currentStatus, "matchId:", currentMatchId, "hasChecked:", hasCheckedMatchTracking.current, "lastProcessed:", lastProcessedMatchId.current, "lastStatus:", lastProcessedStatus.current);

      // Check if this is a match that requires navigation (not NO_ACTIVE_MATCH)
      const requiresNavigation = data.type !== BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH;

      // Check if this is a new match OR different status for same match
      const isNewMatch = !lastProcessedMatchId.current || lastProcessedMatchId.current !== currentMatchId;
      const isDifferentStatus = lastProcessedStatus.current !== currentStatus;
      const shouldProcess = !hasCheckedMatchTracking.current && requiresNavigation && (isNewMatch || isDifferentStatus);

      if (shouldProcess) {
        console.log("[MATCH_TRACKING] Processing match tracking data change:", currentStatus, "matchId:", currentMatchId, "isNewMatch:", isNewMatch, "isDifferentStatus:", isDifferentStatus);
        hasCheckedMatchTracking.current = true;
        // Force process to ensure navigation happens when user is in battle screen
        // This handles: user in lobby, match status changes, should auto-navigate
        handleMatchTrackingData(data, true); // Force process to handle status changes
        // Reset flag after processing to allow re-checking
        setTimeout(() => {
          hasCheckedMatchTracking.current = false;
        }, 1000);
      } else {
        console.log("[MATCH_TRACKING] Skipping - same match and status or already checking");
      }
    }
  }, [matchTrackingData, responseType, isLoadingSeason, isLoadingMatchTracking, handleMatchTrackingData]);

  /**
   * Handle match tracking - restore state when user returns to battle screen
   * This checks if there's an active match and restores the appropriate UI state
   * Runs when screen is focused (user clicks on battle tab)
   * IMPORTANT: Always check when user clicks battle tab, even if they out from match or app
   */
  useFocusEffect(
    useCallback(() => {
      console.log("[MATCH_TRACKING] Screen focused - battle tab clicked");

      // Mark that battle screen is focused
      isBattleScreenFocused.current = true;

      // Always reset flags when screen is focused to allow re-checking
      // This ensures that even if user out from match/app and come back, it will check again
      hasCheckedMatchTracking.current = false;
      lastProcessedMatchId.current = null; // Reset to allow re-processing same match
      lastProcessedStatus.current = null; // Reset status too
      console.log("[MATCH_TRACKING] Reset all flags on focus");

      // ALWAYS check when battle tab is clicked
      // This is the PRIMARY handler for app kill scenario: user kills app, reopens, clicks battle
      const checkAndNavigate = async () => {
        // If season not ready, wait a bit and let useEffect handle it
        // But also try to check after a delay
        if (responseType !== 'ACTIVE' || isLoadingSeason) {
          console.log("[MATCH_TRACKING] Season not ready, will retry. responseType:", responseType, "isLoadingSeason:", isLoadingSeason);

          // Retry after season loads (useEffect will also handle this)
          const retryTimer = setTimeout(async () => {
            // Check again after delay
            const currentResponseType = responseType;
            const currentIsLoading = isLoadingSeason;

            if (currentResponseType === 'ACTIVE' && !currentIsLoading && !hasCheckedMatchTracking.current) {
              console.log("[MATCH_TRACKING] Retrying after delay...");
              await performCheck();
            }
          }, 1000);

          return () => clearTimeout(retryTimer);
        }

        // Season is ready, check immediately
        await performCheck();
      };

      const performCheck = async () => {
        // Skip if already checking (race condition protection)
        if (hasCheckedMatchTracking.current) {
          console.log("[MATCH_TRACKING] Already checking, skipping duplicate...");
          return;
        }

        // Double check season is active
        if (responseType !== 'ACTIVE') {
          console.log("[MATCH_TRACKING] Season not active, skipping. responseType:", responseType);
          return;
        }

        try {
          console.log("[MATCH_TRACKING] 🔄 Force refetching match status on battle tab click...");
          hasCheckedMatchTracking.current = true;

          const trackingResult = await refetchMatchTracking();
          const data = trackingResult.data?.data?.data as IBattleMatchTrackingResponse | undefined;

          if (data) {
            console.log("[MATCH_TRACKING] ✅ Got match data:", data.type, "matchId:", data.matchId || data.match?.id);
            // ALWAYS force process when user clicks battle tab
            // This ensures user goes to correct screen (arena/pick-pokemon) even after killing app
            handleMatchTrackingData(data, true); // Force process - ignore all previous state
          } else {
            console.log("[MATCH_TRACKING] No match data");
          }

          // Reset flag after processing
          setTimeout(() => {
            hasCheckedMatchTracking.current = false;
          }, 2000);
        } catch (error) {
          console.error("[MATCH_TRACKING] Error refetching:", error);
          hasCheckedMatchTracking.current = false;
        }
      };

      // Start check immediately when battle tab is clicked
      checkAndNavigate();

      // Cleanup: mark screen as unfocused when leaving
      return () => {
        isBattleScreenFocused.current = false;
      };
    }, [responseType, isLoadingSeason, refetchMatchTracking, handleMatchTrackingData])
  );

  // Handle season state based on response type
  useEffect(() => {
    if (isLoadingSeason) return;

    // Case 1: ACTIVE - Show normal battle screen (no modal)
    if (responseType === 'ACTIVE') {
      setShowSeasonEndedModal(false);
      setShowFirstTimeModal(false);
      return;
    }

    // Case 2: ENDED - Show season ended modal
    if (responseType === 'ENDED' && seasonData) {
      setShowSeasonEndedModal(true);
      setShowNewSeasonModal(false);
      setShowFirstTimeModal(false);
      return;
    }

    // Case 3: NULL - First time user, show first time modal
    if (responseType === 'NULL') {
      setShowFirstTimeModal(true);
      setShowSeasonEndedModal(false);
      setShowNewSeasonModal(false);
      return;
    }
  }, [responseType, seasonData, isLoadingSeason]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket("matching", accessToken);
    socketRef.current = socket;

    const onMatchingEvent = async (payload: IBattleMatchFound | IBattleMatchStatusUpdate | any) => {
      console.log("[BATTLE] matching-event received:", payload);

      // Handle MATCH_FOUND - show accept modal with countdown
      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND) {
        const match = payload?.match;

        if (match && 'opponent' in payload) {
          console.log("[BATTLE] MATCH_FOUND - matchId:", match.id, "endTime:", match.endTime);

          // Reset status match to allow accepting new match
          setStatusMatch(null);

          // Update local state for modal
          setMatchedPlayer(payload);
          setShowAcceptModal(true);

          // Also update global store for notification on other tabs
          showGlobalMatchFound(payload as IBattleMatchFound, match.id.toString());

          // Note: Don't join rooms yet, wait for MATCH_STATUS_UPDATE with IN_PROGRESS
        }
      }

      // Handle MATCH_STATUS_UPDATE - navigate based on status
      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE) {
        console.log("[BATTLE] MATCH_STATUS_UPDATE - status:", payload.status, "matchId:", payload.matchId);

        if (payload.status === "IN_PROGRESS" && payload.matchId) {
          const matchId = payload.matchId;

          // ✅ CRITICAL: Emit both join-matching-room AND join-user-match-room (as per index.html)
          socket.emit("join-matching-room", { matchId });
          socket.emit("join-user-match-room", { matchId });
          console.log("[BATTLE] Joined matching-room and user-match-room for matchId:", matchId);

          setShowAcceptModal(false);
          setStatusMatch(null);
          setMatchedPlayer(null);
          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();

          // Clear cache and last match result when starting new match
          try {
            clearLastMatchResult();
          } catch (e) {
            console.warn("Failed to clear last match result", e);
          }
          queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
          queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });

          // Navigate to pick pokemon screen
          // Use replace to prevent back navigation to battle screen when match starts
          router.replace({
            pathname: ROUTES.APP.PICK_POKEMON,
            params: {
              matchId: String(matchId),
            },
          });
        }

        if (payload.status === "CANCELLED") {
          console.log("[BATTLE] Match cancelled:", payload.message);
          setShowAcceptModal(false);
          setStatusMatch(null);
          setMatchedPlayer(null);
          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();

          Alert.alert(
            t("battle.lobby.alerts.match_cancelled_title"),
            payload.message || t("battle.lobby.alerts.match_cancelled_default")
          );
        }
      }

      // Handle MATCHMAKING_FAILED
      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCHMAKING_FAILED || payload?.type === "MATCHMAKING_FAILED") {
        console.log("[BATTLE] Matchmaking failed:", payload.reason || payload.message);
        setInQueue(false);
        setStatusMatch(null);
        setGlobalInQueue(false);

        if (payload.reason || payload.message) {
          Alert.alert(
            t("common.error"),
            payload.reason || payload.message || t("battle.lobby.alerts.queue_error_message")
          );
        }
      }
    };

    socket.on("matching-event", onMatchingEvent);

    // Global listener for match-completed (works even after navigating to result screen)
    const onMatchCompleted = (payload: any) => {
      console.log("Match completed (global):", payload);
      try {
        setLastMatchResult(payload);
        const matchId = payload?.matchId || payload?.match?.id;
        if (matchId) {
          // Invalidate user matching history to refetch latest data
          queryClient.invalidateQueries({ queryKey: ['user-matching-history'] });
          // Navigate to result screen
          router.replace({
            pathname: "/(app)/(battle)/result",
            params: { matchId: String(matchId) },
          } as any);
        }
      } catch (e) {
        console.warn("Failed to handle match-completed", e);
      }
    };

    socket.on("match-completed", onMatchCompleted);

    return () => {
      socket.off("matching-event", onMatchingEvent);
      socket.off("match-completed", onMatchCompleted);
      // disconnectSocket();
    };
  }, [accessToken, router, setGlobalInQueue, showGlobalMatchFound, hideGlobalMatchFound, clearLastMatchResult, setLastMatchResult, queryClient]);
  //------------------------End------------------------//



  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../../../assets/images/list_pokemon_bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <TWLinearGradient
          colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        />

        {/* Top status bar (respect safe area) */}
        <SeasonInfo insetsTop={insets.top} />

        {/* Stats Preview */}
        <StatsBattle />

        {/* Title & History Button */}
        <View className="px-5 mt-6 flex-row items-center justify-between">
          <ThemedText style={{ color: "#fbbf24", letterSpacing: 3, fontSize: 18, fontWeight: "900" }}>
            {t("battle.lobby.title")}
          </ThemedText>
          <HapticPressable
            className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10"
            onPress={() => setShowHistory(true)}
          >
            <History size={16} color="#22d3ee" />
            <ThemedText style={{ color: "#22d3ee", fontSize: 13, fontWeight: "600" }}>{t("battle.lobby.history_button")}</ThemedText>
          </HapticPressable>
        </View>

        {/* Versus slot */}
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            <GlowingRingEffect color="#22d3ee" ringSize={260} particleCount={18} />
            <View className="absolute items-center gap-2">
              <View className="flex-row items-center gap-5 mt-2">
                <View className="items-center gap-1">
                  <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <UserAvatar avatar={user?.data?.avatar} name={user?.data?.name || ""} size="large" />
                  </Animated.View>
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>{user?.data?.name}</ThemedText>
                </View>
                <TWLinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 2, borderRadius: 999 }}
                >
                  <View className="px-4 py-2 rounded-full bg-black/70">
                    <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                  </View>
                </TWLinearGradient>
                <View className="items-center gap-1">
                  {inQueue ? (
                    <Animated.View style={{ transform: [{ scale: pulse }] }}>
                      <View className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-400/50" />
                    </Animated.View>
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 border-dashed" />
                  )}
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>
                    {inQueue ? t("battle.lobby.queue_status.searching") : t("battle.lobby.queue_status.waiting")}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center gap-3 mt-3">
                <HapticPressable
                  className="rounded-full overflow-hidden"
                  onPress={handleStartRanked}
                  disabled={inQueue || responseType !== 'ACTIVE' || isLoadingSeason}
                >
                  <TWLinearGradient
                    colors={inQueue || responseType !== 'ACTIVE' || isLoadingSeason ? ["#64748b", "#374151"] : inQueue ? ["#10b981", "#059669"] : ["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 14, paddingHorizontal: 28 }}
                  >
                    <Animated.View style={{ opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 1] }) }}>
                      <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", letterSpacing: 1.2 }}>
                        {inQueue ? t("battle.lobby.buttons.queueing") : t("battle.lobby.buttons.find_match")}
                      </ThemedText>
                    </Animated.View>
                  </TWLinearGradient>
                </HapticPressable>
                {inQueue ? (
                  <HapticPressable
                    className="px-5 py-3 rounded-full border border-red-400/40 bg-red-500/20"
                    onPress={handleCancelQueue}
                  >
                    <ThemedText style={{ color: "#fca5a5", fontWeight: "700" }}>{t("common.cancel")}</ThemedText>
                  </HapticPressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Queue status typing */}
          <View className="mt-6">
            {inQueue ? (
              <TypingText
                messages={queueMessages}
                loop
                textStyle={{ color: "#93c5fd" }}
              />
            ) : null}
          </View>
        </View>

        {/* Bottom actions */}
        <View className="px-5 pb-6">
          <View className="flex-row gap-3">
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleOpenLeaderboard}>
              <View className="flex-row items-center gap-2 mb-1">
                <Trophy size={18} color="#22d3ee" />
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.leaderboard_title")}</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.leaderboard_subtitle")}</ThemedText>
            </HapticPressable>
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewTopRewards}>
              <View className="flex-row items-center gap-2 mb-1">
                <Crown size={18} color="#fbbf24" />
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.rewards_title")}</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.rewards_subtitle")}</ThemedText>
            </HapticPressable>
          </View>

          <HapticPressable className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewRankInfo}>
            <View className="flex-row items-center gap-2 mb-1">
              <Info size={18} color="#60a5fa" />
              <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.rank_info_title")}</ThemedText>
            </View>
            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.rank_info_subtitle")}</ThemedText>
          </HapticPressable>
        </View>

        {/* Subtle scanline overlay for game feel */}
        <View pointerEvents="none" style={styles.scanline} />
      </ImageBackground>

      <ModalBattleHistory
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      />

      <ModalLeaderboard
        visible={showLeaderboard}
        onRequestClose={() => setShowLeaderboard(false)}
        rankName="N5"
      />

      <ModalRewardLeaderboard
        visible={showRewards}
        onRequestClose={() => setShowRewards(false)}
      />

      {/* Accept Match Modal */}
      <ModalBattleAccept
        showAcceptModal={showAcceptModal}
        matchedPlayer={matchedPlayer as IBattleMatchFound}
        setShowAcceptModal={(show) => {
          setShowAcceptModal(show);
          if (!show) {
            // Also hide global modal when closing local modal
            hideGlobalMatchFound();
          }
        }}
        setMatchedPlayer={setMatchedPlayer}
        setInQueue={setInQueue}
        statusMatch={statusMatch}
        setStatusMatch={setStatusMatch}
      />

      {/* Season Ended Modal */}
      <ModalSeasonEnded
        visible={showSeasonEndedModal}
        onRequestClose={() => setShowSeasonEndedModal(false)}
        data={responseType === 'ENDED' ? seasonData as any : null}
        onContinue={handleSeasonEndedContinue}
        onClaimComplete={handleClaimRewardComplete}
      />

      {/* New Season Info Modal */}
      <ModalNewSeasonInfo
        visible={showNewSeasonModal}
        onRequestClose={handleNewSeasonModalClose}
        data={newSeasonInfo}
      />

      {/* First Time User Modal */}
      <ModalFirstTimeUser
        visible={showFirstTimeModal}
        onRequestClose={() => setShowFirstTimeModal(false)}
        onJoinComplete={handleFirstTimeJoinComplete}
      />

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scanline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  // Most layout styles moved to Tailwind classes above
});


