// authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/api.js';
import { connectSocket } from '../api/socket.js';

// ⏩ Login
export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const res = await authApi.login(credentials);
    localStorage.setItem('token', res.data.token);
    connectSocket(res.data.token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// ✅ Register
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await authApi.signup(userData);
    localStorage.setItem('token', res.data.token);
    connectSocket(res.data.token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// ⏩ Me
export const fetchUser = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    const res = await authApi.getMe();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// ⏩ Logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export default authSlice.reducer;
