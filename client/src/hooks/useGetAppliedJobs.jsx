import { setAllAppliedJobs } from "@/redux/jobSlice";
import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/v1/application/get`, {withCredentials: true});
                
                if (res.data.success) {
                    console.log("Applied jobs data:", res.data);
                    // Changed from 'application' to 'applications' to match backend response
                    dispatch(setAllAppliedJobs(res.data.applications));
                }
            } catch (error) {
                console.log("Error fetching applied jobs:", error);
                // Add error handling with toast
                if (error.response?.status === 401) {
                    toast.error("Please login to view applied jobs");
                } else if (error.response?.status === 404) {
                    // Don't show error for no applications found - it's normal
                    dispatch(setAllAppliedJobs([]));
                } else {
                    toast.error("Failed to fetch applied jobs");
                }
            }
        }
        fetchAppliedJobs();
    }, [dispatch]) // Added dispatch to dependency array
};

export default useGetAppliedJobs;