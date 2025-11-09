import ModalBattleAccept from "@components/battle/modal-accept.battle";
import { ROUTES } from "@routes/routes";
import { useMatchingStore } from "@stores/matching/matching.config";
import { usePathname } from "expo-router";

/**
 * Global matching notification component
 * Reuses ModalBattleAccept for match found popup
 * Only shows modal when NOT on battle screen (battle screen has its own modal)
 */
export default function GlobalMatchingNotification() {
    const pathname = usePathname();
    const {
        matchFoundModal,
        hideMatchFoundModal,
        setMatchStatus,
        setIsInQueue,
    } = useMatchingStore();

    // Only show global modal when NOT on battle screen
    const isOnBattleScreen = pathname === ROUTES.TABS.BATTLE;
    const shouldShowGlobalModal = matchFoundModal.show && !isOnBattleScreen;

    return (
        <>
            {/* Reuse ModalBattleAccept for match found popup - only show when NOT on battle screen */}
            {shouldShowGlobalModal && matchFoundModal.matchedPlayer && (
                <ModalBattleAccept
                    showAcceptModal={true}
                    matchedPlayer={matchFoundModal.matchedPlayer}
                    setShowAcceptModal={(show) => {
                        if (!show) {
                            hideMatchFoundModal();
                        }
                    }}
                    setMatchedPlayer={() => {
                        // Do nothing - handled by store
                    }}
                    setInQueue={setIsInQueue}
                    statusMatch={matchFoundModal.statusMatch}
                    setStatusMatch={setMatchStatus}
                />
            )}
        </>
    );
}
