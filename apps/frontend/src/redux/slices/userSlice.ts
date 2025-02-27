import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: string | null;
    email: string | null;
    username: string | null;
    currentBalance: string | null;
    totalEarning: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    id: null,
    email: null,
    username: null,
    currentBalance: null,
    totalEarning: null,
    loading: false,
    error: null,
};

export const fetchUserData = createAsyncThunk(
    'user/fetchUserData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to fetch user data');
            }

            return data.user;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.username = action.payload.username;
            state.currentBalance = action.payload.currentBalance;
            state.totalEarning = action.payload.totalEarning;
        },
        logout: (state) => {
            state.id = null;
            state.email = null;
            state.username = null;
            state.currentBalance = null;
            state.totalEarning = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.id = action.payload.id;
                state.email = action.payload.email;
                state.username = action.payload.username;
                state.currentBalance = action.payload.currentBalance;
                state.totalEarning = action.payload.totalEarning;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
