import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: string | null;
    email: string | null;
    role: 'ADMIN' | 'MODERATOR' | null;
}

const initialState: UserState = {
    id: null,
    email: null,
    role: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.id = null;
            state.email = null;
            state.role = null;
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
