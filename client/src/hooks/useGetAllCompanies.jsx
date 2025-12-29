import { setCompanies} from '@/redux/companySlice'
// import { COMPANY_API_END_POINT} from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllCompanies = () => {
    const dispatch = useDispatch();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    useEffect(()=>{
        const fetchCompanies = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/company/getcompany`,{withCredentials:true});
                console.log('called');
                if(res.data.success){
                    dispatch(setCompanies(res.data.companies));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCompanies();
    },[])
}

export default useGetAllCompanies