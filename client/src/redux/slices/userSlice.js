import { createSlice } from "@reduxjs/toolkit"
import ErrorManager from "../../resources/ErrorManager"
import { getAuth } from "firebase/auth";
import api from "../../services/api"
import FirebaseApp from "../../services/firebaseApp";
import { async } from "@firebase/util";

export const userSlice = createSlice({
    name: 'users',
    initialState: {
        currentUser: null,
        error: null,
        message: null,
        isBusy: false
    },
    reducers: {
        setCurrentUser(state, action) {
            state.currentUser = action.payload;
            sessionStorage.setItem("user-id", action.payload.id);
        },
        resetCurrentUser: (state) => {
            state.currentUser = null;
        },
        signOut: (state) => {
            state.currentUser = null;
            sessionStorage.removeItem("user-id");

            const auth = getAuth(FirebaseApp);
            if (auth.currentUser) {
                auth.signOut();
            }
        },
        setUserError: (state, action) => {
            state.error = action.payload;
        },
        resetUserError: (state) => {
            state.error = null
        },
        setUserMessage: (state, action) => {
            state.message = action.payload;
        },
        resetUserMessage: (state) => {
            state.message = null
        },
        setUserBusyMode: (state, action) => {
            state.isBusy = action.payload;
        }
    },
})
export const { setUserError, resetUserError, resetCurrentUser, setCurrentUser, signOut, setUserMessage, resetUserMessage, setUserBusyMode } = userSlice.actions;

export default userSlice.reducer;

export const postUser = (obj) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/users`, obj);
        console.log(response);
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data))
    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/users" }
        ])));
    }
}

export const loginWithEmailAndPassword = (email, password) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/auth/login`, { email, password });
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/auth/login" }
        ])));
    }
}

export const federatedLogin = (token, userData) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.post(`/auth/federated_login`, { userData }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));

    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/auth/federated_login" }
        ])));
    }
}

export const updateUserInfo = (newData) => async (dispatch) => {
    try {
        dispatch(setUserBusyMode(true));
        const response = await api.put(`/users/user_info/${newData.id}`, newData);
        dispatch(setUserBusyMode(false));
        dispatch(setCurrentUser(response.data));
        dispatch(setUserMessage({
            title: "Actualizacion completada",
            message: "Se han actualizado tus datos de usuario correctamente",
            details: []
        }))

    } catch (error) {
        dispatch(setUserBusyMode(false));
        dispatch(setUserError(ErrorManager.CreateErrorInfoObject(error, [
            { code: error.code },
            { request: "POST: http://localhost:3001/users//user_info/:user_id" }
        ])));
    }
}