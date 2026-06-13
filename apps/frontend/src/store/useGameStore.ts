import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GamePhase = 'LOGIN' | 'WAITING' | 'VOTING_TEAM' | 'VOTING_DIGIMER' | 'TRIVIA' | 'TRANSITION' | 'PRE_WATERING' | 'WATERING' | 'FINAL';

interface SessionState {
    phase: GamePhase;
    currentQuestion: number;
    timer: number;
    treeStage: number;
    totalWater: number;
}

interface UserState {
    id: string;
    name: string;
    division: string;
    collectedWater: number;
    contributedWater: number;
    votes: {
        team: string | null;
        digimer: string | null;
    };
}

interface GameStore {
    // Session State
    phase: GamePhase;
    currentQuestion: number;
    timer: number;
    treeStage: number;
    totalWater: number;

    // User State
    user: {
        id: string;
        name: string;
        division: string;
        isAdmin: boolean;
    } | null;
    collectedWater: number;
    contributedWater: number;
    voteTeam: string | null;
    voteDigi: string | null;
    _hasHydrated: boolean;
    toastMessage: string | null;

    // Actions
    setSessionState: (state: Partial<SessionState>) => void;
    setUser: (user: GameStore['user']) => void;
    setUserState: (state: Partial<{ collectedWater: number; contributedWater: number; voteTeam: string; voteDigi: string }>) => void;
    setHasHydrated: (state: boolean) => void;
    setToastMessage: (msg: string | null) => void;
    reset: () => void;
}

const initialState = {
    phase: 'LOGIN' as GamePhase,
    currentQuestion: 0,
    timer: 0,
    treeStage: 0,
    totalWater: 0,
    user: null,
    collectedWater: 0,
    contributedWater: 0,
    voteTeam: null,
    voteDigi: null,
    _hasHydrated: false,
    toastMessage: null,
};

export const useGameStore = create<GameStore>()(
    persist(
        (set) => ({
            ...initialState,
            setSessionState: (state) => set((s) => ({ ...s, ...state })),
            setUser: (user) => set({ user }),
            setUserState: (state) => set((s) => ({ ...s, ...state })),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            setToastMessage: (msg) => set({ toastMessage: msg }),
            reset: () => set((state) => ({ ...initialState, _hasHydrated: state._hasHydrated })),
        }),
        {
            name: 'x-celerate-storage',
            // CRITICAL: Only persist user-specific fields.
            // Session state (phase, timer, currentQuestion, treeStage, totalWater)
            // is transient and comes from the backend via socket.
            // Persisting it caused a race condition where socket session_state
            // events wrote to localStorage before hydration finished restoring
            // user's collectedWater, causing the 0L reset bug on refresh.
            partialize: (state) => ({
                user: state.user,
                collectedWater: state.collectedWater,
                contributedWater: state.contributedWater,
                voteTeam: state.voteTeam,
                voteDigi: state.voteDigi,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);
