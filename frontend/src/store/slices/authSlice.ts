import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId?: string;
    department?: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    loading: false,
    error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
    } catch (err: any) {
        if (err.response?.status === 429) return rejectWithValue('Too many attempts. Please wait a moment and try again.');
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    department?: string;
    phone?: string;
}

export const register = createAsyncThunk('auth/register', async (userData: RegisterPayload, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data;
    } catch (err: any) {
        if (err.response?.status === 429) return rejectWithValue('Too many attempts. Please wait a moment and try again.');
        return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/users/me');
        return data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
        setUser: (state, action: PayloadAction<User>) => { state.user = action.payload; },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        // Register
        builder.addCase(register.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
        // FetchMe
        builder.addCase(fetchMe.pending, (state) => { state.loading = true; });
        builder.addCase(fetchMe.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(fetchMe.rejected, (state) => {
            // Token is invalid/expired — force logout
            state.loading = false;
            state.user = null;
            state.accessToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        });
        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.accessToken = null;
        });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
