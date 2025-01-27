import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from 'primereact/button';
import { Stepper } from 'primereact/stepper';
import { InputOtp } from 'primereact/inputotp';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { StepperPanel } from 'primereact/stepperpanel';
import { getEmailRegex, getPasswordRegex } from './utils/AuthHelpers';


function ForgotPassword(props) {
    const API_URL = props.API_URL;
    const INIT_PATH = props.INIT_PATH;
    const setLoadingBarProgress = props.setLoadingBarProgress;
    const setToastMsg = props.setToastMsg;

    const navigate = useNavigate();

    const stepperRef = useRef(null);

    const [email, setEmail] = useState('');
    const [otpValue, setOTPValue] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');

    const [validEmail, setValidEmail] = useState(true);
    const [validOTP, setValidOTP] = useState(true);
    const [validPassword1, setValidPassword1] = useState(true);
    const [validPassword2, setValidPassword2] = useState(true);

    const [loadingEmailBtn, setLoadingEmailBtn] = useState(false);
    const [loadingOTPValueBtn, setLoadingOTPValueBtn] = useState(false);
    const [loadingPassword1Btn, setLoadingPassword1Btn] = useState(false);
    const [loadingPassword2Btn, setLoadingPassword2Btn] = useState(false);

    useEffect(() => {
        const emailRegex = getEmailRegex();
        setValidEmail(email.length !== 0 && emailRegex.test(email));
    }, [email]);

    useEffect(() => {
        setValidOTP(otpValue.length === 6);
    }, [otpValue]);

    useEffect(() => {
        const passwordRegex = getPasswordRegex();
        setValidPassword1(passwordRegex.test(password1));
    }, [password1]);

    useEffect(() => {
        const passwordRegex = getPasswordRegex();
        setValidPassword2(passwordRegex.test(password2) && password1 === password2);
    }, [password2, password1]);


    const emailSubmit = () => {
        if (!validEmail) return false;

        setLoadingEmailBtn(true);
        setLoadingBarProgress(30);
        // forgot password get email
        fetch(`${API_URL}/fp-get-email/`, {
            method: 'POST',
            headers: { 'accept': 'application.json', 'content-type': 'application/json', },
            body: JSON.stringify({ 'fp_email': email }),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result['status']) {
                        setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 5000 });
                        stepperRef.current.setActiveStep(1);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Warning', detail: result.msg, life: 3000 });
                    }
                    setLoadingEmailBtn(false);
                    setLoadingBarProgress(100);
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: 'Functional error!', life: 3000 });
                    setLoadingEmailBtn(false);
                    setLoadingBarProgress(100);
                }
            );
    }

    const otpSubmit = () => {
        if (!validOTP) return false;

        setLoadingBarProgress(30);
        setLoadingOTPValueBtn(true);

        fetch(`${API_URL}/fp-otp-submit/`, {
            method: 'POST',
            headers: { 'accept': 'application.json', 'content-type': 'application/json', },
            body: JSON.stringify({ 'fp_email': email, 'fp_otp': otpValue }),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result['status']) {
                        setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 5000 });
                        stepperRef.current.setActiveStep(2);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Warning', detail: result.msg, life: 3000 });
                    }
                    setLoadingOTPValueBtn(false);
                    setLoadingBarProgress(100);
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: 'Functional error!', life: 3000 });
                    setLoadingOTPValueBtn(false);
                    setLoadingBarProgress(100);
                }
            );
    }

    const password1Submit = () => {
        setLoadingPassword1Btn(true);
        stepperRef.current.nextCallback();
        setLoadingPassword1Btn(false);
    }

    const password2Submit = () => {
        if (!validPassword2) return false;

        setLoadingPassword2Btn(true);
        setLoadingBarProgress(30);

        fetch(`${API_URL}/fp-password-submit/`, {
            method: 'POST',
            headers: { 'accept': 'application.json', 'content-type': 'application/json', },
            body: JSON.stringify({ 'fp_email': email, 'fp_password': password2 }),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    if (result['status']) {
                        setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 5000 });
                        setLoadingBarProgress(80);
                        setTimeout(() => {
                            navigate(`${INIT_PATH}/login`);
                            setLoadingBarProgress(100);
                        }, 1000);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Warning', detail: result.msg, life: 3000 });
                        setLoadingBarProgress(100);
                    }
                    setLoadingPassword2Btn(false);
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: 'Functional error!', life: 3000 });
                    setLoadingPassword2Btn(false);
                    setLoadingBarProgress(100);
                }
            );
    }

    return (
        <>
            <div className='d-flex justify-content-center'>
                <h1 className='title'>Change Password</h1>
            </div>
            <div className='card container mt-4 p-4'>
                <Stepper ref={stepperRef} linear={true} activeStep={0}>

                    <StepperPanel header="Email" >
                        <div style={{ height: '15rem' }}>
                            <div className='my-2 d-flex justify-content-center'>
                                <div>
                                    Instrunctions:
                                    <ol>
                                        <li>Enter email of your account to reset password of your account</li>
                                        <li>Click <b>'&#8594;'</b> button to submit your email.</li>
                                        <li>You will receive OTP through your email.</li>
                                    </ol>
                                </div>
                            </div>

                            <div className='d-flex justify-content-center mt-4'>
                                <div className="p-inputgroup " style={{ maxWidth: '30rem' }}>
                                    <InputText
                                        type='email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder='Enter Your Email'
                                        variant="filled"
                                    // invalid={!validEmail}
                                    />
                                    <Button
                                        icon="pi pi-arrow-right"
                                        onClick={emailSubmit}
                                        loading={loadingEmailBtn}
                                        disabled={!validEmail}
                                        style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </StepperPanel>

                    <StepperPanel header="OTP">
                        <div style={{ height: '15rem' }}>
                            <div className='my-2 d-flex justify-content-center'>
                                <div>
                                    Instrunctions:
                                    <ol>
                                        <li>Enter OTP sent to your email.</li>
                                        <li>If you haven't received OTP, Click <b>'Resend Code'</b> to get new OTP again.</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="d-flex justify-content-center mt-4">
                                <InputOtp
                                    value={otpValue}
                                    onChange={(e) => setOTPValue(e.value)}
                                    length={6}
                                    integerOnly
                                    variant="filled"
                                // invalid={!validOTP}
                                />
                            </div>
                            <div className="d-flex justify-content-center mt-3 align-self-stretch gap-4">
                                <Button
                                    label="Resend Code"
                                    onClick={emailSubmit}
                                    link
                                    disabled
                                    className="p-0"
                                />
                                <Button
                                    label="Submit Code"
                                    icon='pi pi-arrow-right'
                                    onClick={otpSubmit}
                                    loading={loadingOTPValueBtn}
                                    disabled={!validOTP}
                                    style={{ borderRadius: '0.5rem' }}
                                />
                            </div>
                        </div>
                    </StepperPanel>

                    <StepperPanel header="New Password" >
                        <div style={{ height: '15rem' }}>
                            <div className='my-1 d-flex justify-content-center'>
                                <div>
                                    Instrunctions:
                                    <ol>
                                        <li>At least one lowercase character.</li>
                                        <li>At least one uppercase character.</li>
                                        <li>At least one numeric character.</li>
                                        <li>At least one special character.</li>
                                        <li>Minimum 8 characters, Maximum 32 characters.</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center align-items-center gap-3" >
                                <Password
                                    value={password1}
                                    onChange={(e) => setPassword1(e.target.value)}
                                    strongRegex={getPasswordRegex()}
                                    placeholder='Enter New Password'
                                    toggleMask
                                    variant="filled"
                                    style={{ maxWidth: '30rem' }}
                                />
                                <Button
                                    icon='pi pi-arrow-right'
                                    onClick={password1Submit}
                                    loading={loadingPassword1Btn}
                                    disabled={!validPassword1}
                                    style={{ borderRadius: '50%' }}
                                />
                            </div>

                        </div>
                    </StepperPanel>

                    <StepperPanel header="Confirm Password">
                        <div style={{ height: '15rem' }}>
                            <div className='my-1 d-flex justify-content-center'>
                                <div>
                                    Instrunctions:
                                    <ol>
                                        <li>At least one lowercase character.</li>
                                        <li>At least one uppercase character.</li>
                                        <li>At least one numeric character.</li>
                                        <li>At least one special character.</li>
                                        <li>Minimum 8 characters, Maximum 32 characters.</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center align-items-center gap-3" >
                                <Password
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    strongRegex={getPasswordRegex()}
                                    placeholder='Confirm New Password'
                                    toggleMask
                                    variant="filled"
                                    style={{ maxWidth: '30rem' }}
                                />
                                <Button
                                    icon='pi pi-check'
                                    onClick={password2Submit}
                                    loading={loadingPassword2Btn}
                                    disabled={!validPassword2}
                                    style={{ borderRadius: '50%' }}
                                />
                            </div>

                        </div>
                    </StepperPanel>
                </Stepper>
            </div>
        </>
    );
}

export default ForgotPassword;