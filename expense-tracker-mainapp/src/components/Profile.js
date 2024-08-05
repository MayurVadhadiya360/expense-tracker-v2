import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from "react-router-dom";
import { GlobalDataContext } from '../App';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';

function Profile({ userData, getUserData }) {
    // const navigate = useNavigate();
    const { API_URL, setToastMsg, setLoadingBarProgress } = useContext(GlobalDataContext);

    const [email, setEmail] = useState(userData['email']);
    const [username, setUsername] = useState(userData['name']);
    const [profilePic, setProfilePic] = useState(userData.profilePic || null);
    const [profilePicFile, setProfilePicFile] = useState(null);

    const [updating, setUpdating] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(function () {
        // Set values again if data changes
        setEmail(userData['email']);
        setUsername(userData['name']);
        setProfilePic(userData.profilePic || null);
    }, [userData]);

    const updateProfile = async () => {
        // Set loading while request is processing
        setLoading(true);
        setLoadingBarProgress(30);

        // Create a FormData object
        const formData = new FormData();
        // Append the username and email fields
        formData.append('username', username);
        formData.append('email', email);
        formData.append('profilePic', profilePicFile);

        try {
            const response = await fetch(`${API_URL}/update-profile/`, {
                method: 'POST',
                body: formData,
            });
            setLoadingBarProgress(60);

            const data = await response.json();
            setLoadingBarProgress(90);

            if (response.ok) {
                // Handle successful response
                if (data['status']) {
                    getUserData();
                }
                setToastMsg({ severity: 'success', summary: 'Sucess', detail: data.msg, life: 3000 });
            } else {
                // Handle server-side errors
                console.error('Error updating profile:', data);
                setToastMsg({ severity: 'error', summary: 'Error', detail: data.msg, life: 3000 });
            }
        } catch (error) {
            // Handle client-side errors
            console.error('Network or other error:', error);
            setToastMsg({ severity: 'error', summary: 'Error', detail: "Network or other error!", life: 3000 });
        } finally {
            setUpdating(false);
            setLoading(false);
            setLoadingBarProgress(100);
        }
    }

    const imageSelect = (e) => {
        // Set file data for sending file to the server
        setProfilePicFile(e.files[0] ? e.files[0] : null)
        // Set blob url to show preview of the select image
        setProfilePic(e.files ? e.files[0].objectURL : "");
    }

    const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: false, className: ' p-button-outlined' };

    return (
        <>
            <div className='container' style={{ maxWidth: '40rem' }}>
                <div className='card m-2'>

                    <div className='d-flex justify-content-center mt-4'>
                        {
                            profilePic ?
                                <div className='d-flex justify-content-center'>
                                    <img src={profilePic} className='profile-img-circle' alt='Profile Pic' />
                                </div>
                                :
                                <div className='d-flex justify-content-center align-items-center profile-img-circle' style={{ backgroundColor: '#e5e7eb', }}>
                                    <i className='pi pi-user' style={{ fontSize: '100px', }}> </i>
                                </div>
                        }
                    </div>

                    <div className='d-flex justify-content-center'>
                        <div className='my-2 p-3' style={{ width: '30rem' }}>

                            <div className="p-inputgroup flex-1 mx-1 my-2">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <InputText
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value) }}
                                    placeholder="Username"
                                    readOnly={!updating}
                                />
                            </div>

                            <div className="p-inputgroup flex-1 mx-1 my-3">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-envelope"></i>
                                </span>
                                <InputText
                                    value={email}
                                    placeholder="Email"
                                    readOnly
                                    disabled
                                />
                            </div>

                            <div className="d-flex justify-content-center mx-1 my-2" >
                                <div style={{ display: updating ? 'block' : 'none' }}>
                                    <FileUpload
                                        mode='basic'
                                        chooseLabel='Select Profile Picture'
                                        accept='image/*'
                                        onSelect={(e) => { imageSelect(e); }}
                                        onClear={(e) => { setProfilePic(userData.profilePic || null) }}
                                        chooseOptions={chooseOptions}
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-evenly mx-1 my-3">
                                <Button
                                    label='Reset Password'
                                    icon='pi pi-lock'
                                    link
                                    visible={!updating}
                                    onClick={(e) => {
                                        /*navigate(`${INIT_PATH}/change-password`);*/
                                        setToastMsg({ severity: 'info', summary: 'Info', detail: "Coming soon! Or You can try forgot password", life: 3000 });
                                    }}
                                />
                                <Button
                                    label='Change Email'
                                    icon='pi pi-envelope'
                                    link
                                    visible={!updating}
                                    onClick={(e) => {
                                        /*navigate(`${INIT_PATH}/change-email`);*/
                                        setToastMsg({ severity: 'info', summary: 'Info', detail: "Coming soon!", life: 3000 });
                                    }}
                                />
                            </div>

                            <div className="d-flex justify-content-evenly mx-1 my-3">
                                <Button
                                    label="Edit Profile"
                                    icon="pi pi-pen-to-square"
                                    severity='help'
                                    outlined
                                    className='rounded-custom'
                                    visible={!updating}
                                    onClick={(e) => { setUpdating(true) }}
                                />

                                <Button
                                    label="Cancel"
                                    icon="pi pi-times"
                                    severity='danger'
                                    className='rounded-custom'
                                    disabled={loading}
                                    visible={updating}
                                    outlined
                                    onClick={(e) => { setUpdating(false) }}
                                />

                                <Button
                                    label="Save"
                                    icon="pi pi-check"
                                    severity='sucess'
                                    className='rounded-custom'
                                    loading={loading}
                                    visible={updating}
                                    onClick={(e) => { updateProfile() }}
                                />

                            </div>



                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;