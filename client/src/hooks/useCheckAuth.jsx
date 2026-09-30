import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAuthChecked } from '@/redux/authSlice'
import { refreshAccessToken } from '@/lib/axiosAuth'

// Runs once when the app loads. If the browser still has a valid refreshToken
// cookie, the backend sends back the user + a new access token and the user
// stays logged in. If not (never logged in / logged out / 7 days passed), the
// request fails and the user is simply treated as logged out.
const useCheckAuth = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Old versions saved these; they are not used anymore
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");

        const checkAuth = async () => {
            try {
                await refreshAccessToken(); // sets user + accessToken in redux
            } catch (error) {
                // Not logged in — nothing to do
            } finally {
                dispatch(setAuthChecked(true));
            }
        }
        checkAuth();
    }, [])
}

export default useCheckAuth
