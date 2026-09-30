import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import companySlice from "./companySlice";
import applicationSlice from "./applicationSlice";

const rootReducer = combineReducers({
    auth: authSlice,
    job: jobSlice,
    company: companySlice,
    application: applicationSlice,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;
