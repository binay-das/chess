import type { User } from "./user";

export type ReactNode = any;

export interface NavbarProps {
    user: User | null;
    onSignOut: () => void;
}

export interface NavLinkProps {
    to: string;
    active: boolean;
    children: ReactNode;
}

export interface HomeProps {
    user: User | null;
}

export interface FeatureProps {
    number: string;
    icon: ReactNode;
    title: string;
    description: string;
}

export interface JoinRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SignInPageProps {
    onSuccess?: (user: User, token: string) => void;
}

export interface SignUpPageProps {
    onSuccess?: (user: User, token: string) => void;
}

export interface GameOverModalProps {
    gameOverDetails: {
        isDraw?: boolean;
        winnerId?: string;
        winnerUsername?: string;
        drawReason?: string;
        winReason?: string;
    };
    userId?: string;
    onRematch: () => void;
    onLeave: () => void;
}

export interface OfferModalProps {
    eyebrow: string;
    title: string;
    description: string;
    icon: ReactNode;
    acceptLabel: string;
    declineLabel: string;
    onAccept: () => void;
    onDecline: () => void;
}

export interface DashboardStatProps {
    label: string;
    value: number | string;
    icon: ReactNode;
    accent?: boolean;
    loading?: boolean;
}

export interface SignUpStatProps {
    number: string;
    title: string;
    description: string;
}

export interface FormFieldProps {
    label: string;
    error?: string;
    [key: string]: any;
}
