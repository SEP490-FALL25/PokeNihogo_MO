import { getSocket } from '@configs/socket';
import { useAuthStore } from '@stores/auth/auth.config';
import { useMatchingStore } from '@stores/matching/matching.config';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function BattleLayout() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const currentMatchId = useMatchingStore((s) => s.currentMatchId);

    useEffect(() => {
        if (!accessToken || !currentMatchId) return;

        const socket = getSocket("matching", accessToken);

        // Function to join matching rooms
        const joinRooms = () => {
            socket.emit("join-matching-room", { matchId: currentMatchId });
            socket.emit("join-user-match-room", { matchId: currentMatchId });
            console.log("Layout: Joined matching rooms for matchId:", currentMatchId);
        };

        // Join rooms immediately if already connected, otherwise wait for connect event
        if (socket.connected) {
            joinRooms();
        } else {
            socket.on("connect", joinRooms);
        }

        return () => {
            socket.off("connect", joinRooms);
        };
    }, [accessToken, currentMatchId]);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'none', // No transition for battle flows
            }}
        >
            <Stack.Screen name="draft" />
            <Stack.Screen name="arena" />
            <Stack.Screen name="pick-pokemon" />
        </Stack>
    );
}

