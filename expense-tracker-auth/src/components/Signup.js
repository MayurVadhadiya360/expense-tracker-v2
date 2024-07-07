import React, { useState } from 'react'
import { Link } from "react-router-dom";
import { validate_email, validate_password } from './utils/AuthHelpers';
import '../css/login.css';
import Swal from 'sweetalert2';


function Signup(props) {
    const [password1ViewType, setPassword1ViewType] = useState("password");
    const [password2ViewType, setPassword2ViewType] = useState("password");
    const API_URL = props.API_URL;

    const onPassword1Toggle = () => {
        let inputPassword = document.getElementById('password1-signup');
        let togglePassBtn = document.getElementById('toggle-password1-type');

        password1ViewType === "password" ? setPassword1ViewType("text") : setPassword1ViewType("password");
        inputPassword.setAttribute('type', password1ViewType);

        if (password1ViewType === "password") {
            togglePassBtn.classList.remove("bi-eye-slash");
            togglePassBtn.classList.add("bi-eye");
        }
        else if (password1ViewType === "text") {
            togglePassBtn.classList.add("bi-eye-slash");
            togglePassBtn.classList.remove("bi-eye");
        }
    }

    const onPassword2Toggle = () => {
        let inputPassword = document.getElementById('password2-signup');
        let togglePassBtn = document.getElementById('toggle-password2-type');

        password2ViewType === "password" ? setPassword2ViewType("text") : setPassword2ViewType("password");
        inputPassword.setAttribute('type', password2ViewType);

        if (password2ViewType === "password") {
            togglePassBtn.classList.remove("bi-eye-slash");
            togglePassBtn.classList.add("bi-eye");
        }
        else if (password2ViewType === "text") {
            togglePassBtn.classList.add("bi-eye-slash");
            togglePassBtn.classList.remove("bi-eye");
        }
    }

    const validate_name_signup = () => {
        var nameErrorMsgTag = document.getElementById("name-error-signup");
        var name = document.getElementById("name-signup").value;
        if (name.length === 0) {
            nameErrorMsgTag.style.color = "red";
            nameErrorMsgTag.innerHTML = "Name Required";
            return false;
        }
        else {
            nameErrorMsgTag.innerHTML = ""; //"Validation Successfull";
            return true;
        }
    }

    const validate_email_signup = () => {
        var emailErrorMsgTag = document.getElementById("email-error-signup");
        var email = document.getElementById("email-signup").value;
        return validate_email(email, emailErrorMsgTag);
    }

    const validate_password1_signup = () => {
        var passwordErrorMsgTag = document.getElementById("password1-error-signup");
        var password = document.getElementById("password1-signup").value;
        return validate_password(password, passwordErrorMsgTag);
    }

    const validate_password2_signup = () => {
        var passwordErrorMsgTag = document.getElementById("password2-error-signup");
        var password1 = document.getElementById("password1-signup").value;
        var password2 = document.getElementById("password2-signup").value;

        if (password2.length === 0) {
            passwordErrorMsgTag.style.color = "red";
            passwordErrorMsgTag.innerHTML = "Password required";
            return false;
        }
        else if (password1 === password2) {
            passwordErrorMsgTag.innerHTML = ""; //"Validation Successfull";
            return true;
        }
        else {
            passwordErrorMsgTag.style.color = "red";
            passwordErrorMsgTag.innerHTML = "Password doesn't match";
            return false;
        }
    }

    const create_user = () => {
        if (validate_name_signup() && validate_email_signup() && validate_password1_signup() && validate_password2_signup()) {
            console.log("Signup Call here");
            let signup_data = {
                name: document.getElementById('name-signup').value,
                email: document.getElementById("email-signup").value,
                password: document.getElementById("password1-signup").value,
            }
            fetch(`${API_URL}/signup/`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(signup_data)
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
                    )
                }
            })
        }
    }


    return (
        <>
            <section className="vh-100" style={{ backgroundColor: "#eee" }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: "25px" }}>
                                <div className="card-body p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                                            <p className="text-center h1 fw-bold mb-3 mx-1 mx-md-4 mt-4">Sign up</p>

                                            <form className="mx-1 mx-md-4" id="signupForm">

                                                <div className="d-flex flex-row align-items-center mb-2">
                                                    <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                    <div className="form-outline flex-fill mb-0">
                                                        <label className="form-label" htmlFor="name-signup">Name</label>
                                                        <input type="text" id="name-signup" className="form-control" onKeyUp={validate_name_signup} />
                                                        <span id="name-error-signup"></span>
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-row align-items-center mb-2">
                                                    <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                    <div className="form-outline flex-fill mb-0">
                                                        <label className="form-label" htmlFor="email-signup">Email</label>
                                                        <input type="email" id="email-signup" className="form-control" onKeyUp={validate_email_signup} />
                                                        <span id="email-error-signup"></span>
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-row align-items-center mb-2">
                                                    <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                    <div className="form-outline flex-fill mb-0">
                                                        <label className="form-label" htmlFor="password1-signup">Password</label>
                                                        <div className="input-group">
                                                            <input type="password" id="password1-signup" className="form-control" onKeyUp={validate_password1_signup} />
                                                            <i className="bi bi-eye input-group-text password-eye" id="toggle-password1-type" onClick={onPassword1Toggle}></i>
                                                        </div>
                                                        <span id="password1-error-signup"></span>
                                                    </div>
                                                </div>

                                                <div className="d-flex flex-row align-items-center mb-2">
                                                    <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                                    <div className="form-outline flex-fill mb-0">
                                                        <label className="form-label" htmlFor="password2-signup">Confirm password</label>
                                                        <div className="input-group">
                                                            <input type="password" id="password2-signup" className="form-control" onKeyUp={validate_password2_signup} />
                                                            <i className="bi bi-eye input-group-text password-eye" id="toggle-password2-type" onClick={onPassword2Toggle}></i>
                                                        </div>
                                                        <span id="password2-error-signup"></span>
                                                    </div>
                                                </div>

                                                <div className="text-center text-start mt-2 pt-0 justify-content-center justify-content-start">
                                                    <button type="button" className="btn btn-primary btn-lg py-1"
                                                        onClick={create_user}>Submit</button><br />
                                                    <span id="submit-error-signup"></span>
                                                    <p className="small fw-bold mt-1 mb-0">Already have an account?
                                                        <Link id="register_btn" className="link-danger m-1 p-0 auth-link" to="/login">Login</Link>
                                                    </p>
                                                </div>

                                            </form>

                                        </div>
                                        <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">

                                            <img src="/static/img/draw1.webp" className="img-fluid" alt="Sample" />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Signup;