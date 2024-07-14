import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { togglePasswordState, getEmailRegex, getPasswordRegex } from './utils/AuthHelpers';

function Login(props) {
    const API_URL = props.API_URL;
    const setToastMsg = props.setToastMsg;
    const setLoadingBarProgress = props.setLoadingBarProgress;

    const passwordRef = useRef(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [validEmail, setValidEmail] = useState(false);
    const [validPassword, setValidPassword] = useState(false);

    useEffect(() => {
        const emailRegex = getEmailRegex();
        setValidEmail(email.length !== 0 && emailRegex.test(email));
    }, [email]);

    useEffect(() => {
        const passwordRegex = getPasswordRegex();
        setValidPassword(passwordRegex.test(password));
    }, [password]);


    const login_user = () => {
        if (!validEmail) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Invalid email!', life: 2000 });
            return false;
        }
        if (!validPassword) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Invalid password!', life: 2000 });
            return false;
        }
        setLoadingBarProgress(30);
        console.log("Login Call here");
        fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result['status']) {
                        setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 3000 });
                        setLoadingBarProgress(90);
                        setTimeout(() => {
                            window.location.href = `${API_URL}/home/`;
                        }, 1500);
                    }
                    else {
                        console.log(result.msg);
                        Swal.fire(
                            {
                                title: 'Warning!',
                                text: result.msg,
                                icon: 'warning',
                                confirmButtonText: 'Okay'
                            }
                        );
                        setLoadingBarProgress(100);
                    }
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: 'Functional error!', life: 3000 });
                    setLoadingBarProgress(100);
                }
            );
    }


    const passwordFooter = (
        <>
            <Divider />
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>At least one special character</li>
                <li>Minimum 8 characters, Maximum 32 characters</li>
            </ul>
        </>
    );

    return (
        <>
            <section className="vh-100" style={{ backgroundColor: '#eee' }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: "25px" }}>
                                <div className="card-body p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-md-9 col-lg-6 col-xl-5">
                                            <img src="https://expense-tracker-cdn.s3.ap-south-1.amazonaws.com/images/draw2.webp" className="img-fluid" alt="Sample" />
                                        </div>
                                        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                                            <form >
                                                <div className="d-flex flex-row align-items-center justify-content-center justify-content-start">
                                                    <p className="text-center h2 fw-medium mb-3 mx-1 mx-md-4 mt-4">Login</p>
                                                    <br /><br /><br /><br />
                                                </div>

                                                {/* <!-- Email input --> */}
                                                <div className="p-inputgroup flex-1 my-3">
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-envelope"></i>
                                                    </span>
                                                    <InputText
                                                        type='email'
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder='Email'
                                                    />
                                                </div>
                                                

                                                {/* <!-- Password input --> */}
                                                <div className="p-inputgroup flex-1 mt-3">
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-lock"></i>
                                                    </span>
                                                    <Password
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder='Password'
                                                        footer={passwordFooter}
                                                        strongRegex={getPasswordRegex()}
                                                        ref={passwordRef}
                                                    />
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-eye" onClick={(e) => togglePasswordState(e.target, passwordRef)}></i>
                                                    </span>
                                                </div>
                                                

                                                <div className="d-flex justify-content-between align-items-center">
                                                    {/* <!-- Checkbox --> */}
                                                    <span className="text-body m-0 p-0 ">
                                                        <Link className='forgot-password' to='/reset-password'>Forgot password?</Link>
                                                    </span>
                                                </div>

                                                <div className="text-center text-start mt-3 pt-2 justify-content-center justify-content-start">
                                                    <button type="button" className="btn btn-primary btn-lg py-1" id="login_btn"
                                                        onClick={login_user}>Login</button>
                                                    <span id="submit-error-login"></span>
                                                    <p className="small fw-bold mt-1 mb-0">Don't have an account?
                                                        <Link className="link-danger m-1 p-0" to="/signup">Sign up</Link>
                                                    </p>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;