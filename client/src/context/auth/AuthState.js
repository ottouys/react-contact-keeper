import React, { useReducer, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import {
    REGISTER_SUCCESS,
    REGISTER_FAIL, 
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    CLEAR_ERRORS
} from '../types';

const AuthState = props => {
    const initialState = {
        token: null,
        isAuthenticated: null,
        loading: true,
        user: null,
        error: null        
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = useCallback(async (token) => {            
        
        if (state.token !== null) {
            token = state.token;
        }

        setAuthToken(token);      

        try {
            const res = await axios.get('/api/auth');

            dispatch({
                type: USER_LOADED,
                payload: res.data
            });            
        } catch (error) {
            dispatch({
                type: AUTH_ERROR,
                payload: error.response.data
            });
        }
    }, []);


    // Register User
    const register = async formData => {
        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }

        try {
            const res = await axios.post('/api/users', formData, config);

            dispatch({
                type: REGISTER_SUCCESS,
                payload: res.data
            });              

            loadUser(res.data.token);
        } catch (error) {
            dispatch({
                type: REGISTER_FAIL,
                payload: error.response.data.msg
            });
        }
    }

    // Login User
    const login = async formData => {
        const config = {
            headers: {
                'Content-type': 'application/json'
            }
        }

        try {
            const res = await axios.post('/api/auth', formData, config);

            dispatch({
                type: LOGIN_SUCCESS,
                payload: res.data
            });              

            loadUser(res.data.token);
        } catch (error) {
            dispatch({
                type: LOGIN_FAIL,
                payload: error.response.data.msg
            });
        }
    }

    // Logout 
    const logout = () => dispatch({ type: LOGOUT });

    // Clear Errors
    const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

    return (
        <AuthContext.Provider
            value = {{
                token: localStorage.getItem('token'),
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                error: state.error,
                register, 
                loadUser,
                login,
                logout,
                clearErrors
            }}>
            { props.children } 
        </AuthContext.Provider>
    )
}

export default AuthState;