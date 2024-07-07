import React, { useState } from 'react'
import '../css/login.css';
import { Link } from "react-router-dom";
import { validate_email, validate_password } from './utils/AuthHelpers';
import Swal from 'sweetalert2';


function Login(props) {
    const [passwordViewType, setPasswordViewType] = useState("password");
    const API_URL = props.API_URL;

    const onPasswordToggle = () => {
        let inputPassword = document.getElementById('password-login');
        let togglePassBtn = document.getElementById('toggle-password-type');
        passwordViewType === "password" ? setPasswordViewType("text") : setPasswordViewType("password");
        inputPassword.setAttribute('type', passwordViewType);

        if (passwordViewType === "password") {
            togglePassBtn.classList.remove("bi-eye-slash");
            togglePassBtn.classList.add("bi-eye");
        }
        else if (passwordViewType === "text") {
            togglePassBtn.classList.add("bi-eye-slash");
            togglePassBtn.classList.remove("bi-eye");
        }
    }

    const validate_email_login = () => {
        var emailErrorMsgTag = document.getElementById("email-error-login");
        var email = document.getElementById("email-login").value;
        return validate_email(email, emailErrorMsgTag);
    }

    const validate_password_login = () => {
        var passwordErrorMsgTag = document.getElementById("password-error-login");
        var password = document.getElementById("password-login").value;
        return validate_password(password, passwordErrorMsgTag);
    }

    const login_user = () => {
        if (validate_email_login() && validate_password_login()) {
            console.log("Login Call here");
            let login_data = {
                email: document.getElementById("email-login").value,
                password: document.getElementById("password-login").value
            }
            fetch(`${API_URL}/login/`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(login_data)
            }).then(response => response.json()).then(data => {
                console.log(data);
                if (data.status) {
                    window.location.href = `${API_URL}/home/`;
                }
                else {
                    console.log(data.msg);
                    Swal.fire(
                        {
                            title: 'Warning!',
                            text: data.msg,
                            icon: 'warning',
                            confirmButtonText: 'Okay'
                        }
                    );
                }
            })
        }

    }

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
                                            <img src="/static/img/draw2.webp" className="img-fluid" alt="Sample" />
                                        </div>
                                        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                                            <form id="loginForm" method="get">
                                                <div className="d-flex flex-row align-items-center justify-content-center justify-content-start">
                                                    <p className="lead h1 fw-bold mb-0 me-3" id="signin">Sign in</p>
                                                    <br /><br /><br /><br />
                                                </div>

                                                {/* <!-- Email input --> */}
                                                <div className="form-outline mb-2">
                                                    <label className="form-label" htmlFor="email-login">Email</label>
                                                    <input type="email" id="email-login" className="form-control form-control-lg"
                                                        placeholder="Enter email" onKeyUp={validate_email_login} />
                                                    <span className='m-0 p-0' id="email-error-login"></span>
                                                </div>

                                                {/* <!-- Password input --> */}
                                                <div className="form-outline mb-2">
                                                    <label className="form-label" htmlFor="password-login">Password</label>
                                                    <div className="input-group">
                                                        <input type="password" id="password-login" className="form-control form-control-lg"
                                                            placeholder="Enter password" onKeyUp={validate_password_login} />
                                                        <i className="bi bi-eye input-group-text password-eye" id="toggle-password-type" onClick={onPasswordToggle}></i>
                                                    </div>
                                                    <span id="password-error-login"></span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    {/* <!-- Checkbox --> */}
                                                    <span className="text-body m-0 p-0 ">
                                                        <Link className='forgot-password' to='/reset-password'>Forgot password?</Link>
                                                    </span>
                                                </div>

                                                <div className="text-center text-start mt-3 pt-2 justify-content-center justify-content-start">
                                                    <button type="button" className="btn btn-primary btn-lg py-1" id="login_btn"
                                                        // style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                                        onClick={login_user}>Login</button>
                                                    <span id="submit-error-login"></span>
                                                    <p className="small fw-bold mt-1 mb-0">Don't have an account?
                                                        <Link id="register_btn" className="link-danger m-1 p-0 auth-link" to="/signup">Register</Link>
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