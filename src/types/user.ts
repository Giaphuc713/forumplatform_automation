interface UserProfile {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL: string | null;
}

interface UserState {
    user: UserProfile | null;
    isLoading: boolean;
    setUser: (user: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    clearUser: () => void;
}
