import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/useGameStore';
import { getBackendUrl } from '@/lib/config';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user, setSessionState, setUserState } = useGameStore();

    const BACKEND_URL = getBackendUrl();

    useEffect(() => {
        // Connect to socket
        const socket = io(BACKEND_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            if (user) {
                socket.emit('join', { id: user.id, name: user.name });
            }
        });

        socket.on('session_state', (state) => {
            console.log('Received session state update:', state);
            setSessionState(state);
        });

        socket.on('user_state', (state) => {
            setUserState(state);
        });

        socket.on('system_resetted', () => {
            console.log('System reset by admin - cleaning up...');
            try {
                const store = useGameStore.getState();

                if (store.user?.isAdmin) {
                    store.setToastMessage("SISTEM TELAH DI-RESET. DATA GAME TELAH DIKOSONGKAN.");
                    // Force session wipe for Admin too! Avoids persisting 160 water.
                    store.setSessionState({ timer: 0, currentQuestion: 0, treeStage: 0, totalWater: 0 });
                } else {
                    console.log('User logout triggered by system reset');
                    // 1. Clear zustand store in-memory
                    store.reset();
                    // 3. Navigate back to root (clean URL, no params to avoid Next.js router errors)
                    if (typeof window !== 'undefined') {
                        window.location.href = '/';
                    }
                }

                // 2. Clear persisted storage globally so neither users nor admins hydrate old states.
                try {
                    localStorage.removeItem('x-celerate-storage');
                } catch (_) { }
            } catch (err) {
                console.error('Error handling system_resetted:', err);
                // Fail-safe: just navigate to root
                if (typeof window !== 'undefined') {
                    window.location.href = '/';
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const emitVote = (candidateId: string, category: string) => {
        socketRef.current?.emit('vote', { candidateId, category });
    };

    const emitAnswer = (questionIndex: number, optionIndex: number) => {
        socketRef.current?.emit('answer', { questionIndex, optionIndex });
    };

    const emitWaterTap = () => {
        socketRef.current?.emit('water_tap', {});
    };

    return {
        emitVote,
        emitAnswer,
        emitWaterTap,
        socket: socketRef.current,
    };
};
