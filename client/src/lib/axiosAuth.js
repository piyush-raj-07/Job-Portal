import axios from "axios"
import { toast } from "sonner"
import store from "@/redux/store"
import { setUser, setAccessToken } from "@/redux/authSlice"

/*
 * Auth for every axios request in the app.
 *
 * 1. Request: attach the access token as "Authorization: Bearer <token>".
 * 2. Response: the access token only lives 15 minutes. When a request comes
 *    back 401, ask the backend for a new one (/user/refresh-token uses the
 *    httpOnly refreshToken cookie), then retry the request once.
 * 3. If the refresh also fails, the session is really over: clear the user
 *    and send them to the login page.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// The refresh token is an httpOnly cookie, so every request must send cookies.
axios.defaults.withCredentials = true

// Guards against a burst of parallel 401s (a page firing three hooks at once)
// queuing three toasts and three redirects.
let handlingExpiry = false

// If several requests fail at once, they all wait for the same refresh call
// instead of each starting their own.
let refreshPromise = null

// Login and register legitimately answer 401/400 for bad credentials. Those
// are form errors for the page to show, not an expired session.
const isAuthEndpoint = (url = "") =>
    url.includes("/user/login") ||
    url.includes("/user/register") ||
    url.includes("/user/refresh-token")

// Used on page load (hooks/useCheckAuth.jsx) and whenever the access token
// expires. The refresh token changes on every call, so two calls at the same
// time would make the second one fail — both callers share one request.
export const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(`${BASE_URL}/api/v1/user/refresh-token`)
            .then((res) => {
                store.dispatch(setAccessToken(res.data.accessToken))
                store.dispatch(setUser(res.data.user))
                return res.data.accessToken
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

const endSession = () => {
    const { user } = store.getState().auth

    // Only meaningful if the app currently believes someone is logged in;
    // a 401 while logged out is expected.
    if (!user || handlingExpiry) return

    handlingExpiry = true

    // Clears the redux user and the access token.
    store.dispatch(setUser(null))
    toast.error("Your session has expired. Please log in again.")

    if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login")
    } else {
        handlingExpiry = false
    }
}

export const installAuthInterceptor = () => {
    // ── Attach access token to every request ─────────────────────
    axios.interceptors.request.use((config) => {
        const { accessToken } = store.getState().auth
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    })

    // ── On 401: refresh the token once, then retry ───────────────
    axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error.response?.status
            const originalRequest = error.config

            if (status !== 401 || !originalRequest || isAuthEndpoint(originalRequest.url)) {
                return Promise.reject(error)
            }

            // Already retried once and still 401 → give up
            if (originalRequest._retry) {
                endSession()
                return Promise.reject(error)
            }
            originalRequest._retry = true

            try {
                const newToken = await refreshAccessToken()

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return axios(originalRequest)
            } catch (refreshError) {
                endSession()
                return Promise.reject(error)
            }
        }
    )
}

export default installAuthInterceptor
