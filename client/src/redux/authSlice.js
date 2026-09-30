import { createSlice } from "@reduxjs/toolkit";

/*
 * Nothing here is saved in localStorage. On every page load the app calls
 * /user/refresh-token (see hooks/useCheckAuth.jsx); the browser sends the
 * httpOnly refreshToken cookie and the backend answers with the user and a
 * new access token — the same way jobs are fetched fresh on every load.
 */

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
        accessToken: null,
        authChecked: false, // false until the page-load session check finishes
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;

            // setUser(null) means logged out, so drop the token too
            if (!action.payload) {
                state.accessToken = null;
            }
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setAuthChecked: (state, action) => {
            state.authChecked = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
        },
    },
});

export const { setLoading, setUser, setAccessToken, setAuthChecked, logout } = authSlice.actions;
export default authSlice.reducer;
