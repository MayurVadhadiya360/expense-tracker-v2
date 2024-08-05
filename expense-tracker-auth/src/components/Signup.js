import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { togglePasswordState, getEmailRegex, getPasswordRegex } from './utils/AuthHelpers';

function Signup(props) {
    const API_URL = props.API_URL;
    const INIT_PATH = props.INIT_PATH;
    const setToastMsg = props.setToastMsg;
    const setLoadingBarProgress = props.setLoadingBarProgress;

    const password1Ref = useRef(null);
    const password2Ref = useRef(null);

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');

    const [validEmail, setValidEmail] = useState(false);
    const [validUsername, setValidUsername] = useState(false);
    const [validPassword1, setValidPassword1] = useState(false);
    const [validPassword2, setValidPassword2] = useState(false);

    useEffect(() => {
        setValidUsername((username !== '' && username !== null))
    }, [username]);

    useEffect(() => {
        const emailRegex = getEmailRegex();
        setValidEmail(email.length !== 0 && emailRegex.test(email));
    }, [email]);

    useEffect(() => {
        const passwordRegex = getPasswordRegex();
        setValidPassword1(passwordRegex.test(password1));
    }, [password1]);

    useEffect(() => {
        const passwordRegex = getPasswordRegex();
        setValidPassword2(passwordRegex.test(password2) && password1 === password2);
    }, [password2, password1]);


    const create_user = () => {
        if (!validUsername) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Invalid username!', life: 2000 });
            return false;
        }
        if (!validEmail) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Invalid email!', life: 2000 });
            return false;
        }
        if (!validPassword1) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Password is not strong!', life: 2000 });
            return false;
        }
        if (!validPassword2) {
            setToastMsg({ severity: 'error', summary: 'Warning', detail: 'Confirm password should be same as entered password!', life: 2000 });
            return false;
        }

        setLoadingBarProgress(30);
        fetch(`${API_URL}/signup/`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: username,
                email: email,
                password: password2,
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
                        Swal.fire(
                            {
                                title: 'Warning!',
                                text: result.msg,
                                icon: 'warning',
                                confirmButtonText: 'Okay'
                            }
                        )
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
            <section className="vh-100" style={{ backgroundColor: "#eee" }}>
                <div className="container h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-lg-12 col-xl-11">
                            <div className="card text-black" style={{ borderRadius: "25px" }}>
                                <div className="card-body p-md-5">
                                    <div className="row justify-content-center">
                                        <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                                            <p className="text-center h2 fw-medium mb-3 mx-1 mx-md-4 mt-4">Sign up</p>

                                            <form className="mx-1 mx-md-4">

                                                {/* <!-- Username input --> */}
                                                <div className="p-inputgroup flex-1 my-2">
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-user"></i>
                                                    </span>
                                                    <InputText
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        placeholder='Username'
                                                    />
                                                </div>

                                                {/* <!-- Email input --> */}
                                                <div className="p-inputgroup flex-1 my-2">
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

                                                {/* <!-- Password1 input --> */}
                                                <div className="p-inputgroup flex-1 my-2">
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-lock"></i>
                                                    </span>
                                                    <Password
                                                        value={password1}
                                                        onChange={(e) => setPassword1(e.target.value)}
                                                        placeholder='Password'
                                                        footer={passwordFooter}
                                                        strongRegex={getPasswordRegex()}
                                                        ref={password1Ref}
                                                    />
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-eye" onClick={(e) => togglePasswordState(e.target, password1Ref)}></i>
                                                    </span>
                                                </div>

                                                {/* <!-- Password2 input --> */}
                                                <div className="p-inputgroup flex-1 my-2">
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-lock"></i>
                                                    </span>
                                                    <Password
                                                        value={password2}
                                                        onChange={(e) => setPassword2(e.target.value)}
                                                        placeholder='Confirm Password'
                                                        strongRegex={getPasswordRegex()}
                                                        ref={password2Ref}
                                                        feedback={false}
                                                    />
                                                    <span className="p-inputgroup-addon">
                                                        <i className="pi pi-eye" onClick={(e) => togglePasswordState(e.target, password2Ref)}></i>
                                                    </span>
                                                </div>

                                                <div className="text-center text-start mt-2 pt-0 justify-content-center justify-content-start">
                                                    <button type="button" className="btn btn-primary btn-lg py-1"
                                                        onClick={create_user}>Submit</button><br />
                                                    <span id="submit-error-signup"></span>
                                                    <p className="small fw-bold mt-1 mb-0">Already have an account?
                                                        <Link className="link-danger m-1 p-0" to={`${INIT_PATH}/login`}>Login</Link>
                                                    </p>
                                                </div>

                                            </form>

                                        </div>
                                        <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">

                                            <img src="https://expense-tracker-cdn.s3.ap-south-1.amazonaws.com/images/draw1.webp" className="img-fluid" alt="Sample" />

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