import React, { useContext, useState, useEffect } from 'react'
import { GlobalDataContext } from '../App';
import { useNavigate } from "react-router-dom";
import { Avatar } from 'primereact/avatar';
import { Menubar } from 'primereact/menubar';
import SidebarView from './SidebarView';


function Navbar({ userData, setVisibleDialogExpense, setDialogActiveIndex }) {
    const navigate = useNavigate();
    const { INIT_PATH } = useContext(GlobalDataContext);
    const [visibleSidebar, setVisibleSidebar] = useState(false);
    const [profilePic, setProfilePic] = useState(userData.profilePic || null);

    useEffect(function () {
        setProfilePic(userData.profilePic || null);
    }, [userData]);

    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => {
                navigate(`${INIT_PATH}/home`);
            }
        },
        {
            label: 'Expenses',
            icon: 'pi pi-receipt',
            command: () => {
                navigate(`${INIT_PATH}/expense`);
            }
        },
        {
            label: 'Insights',
            icon: 'pi pi-chart-bar',
            command: () => {
                navigate(`${INIT_PATH}/insights`);
            }
        },

        {
            label: 'Quick Actions',
            icon: 'pi pi-file-plus',
            items: [
                {
                    label: 'Add Expense',
                    icon: 'pi pi-receipt',
                    command: () => {
                        setDialogActiveIndex(0);
                        setVisibleDialogExpense(true);
                    }
                },
                {
                    label: 'Category',
                    icon: 'pi pi-tags',
                    command: () => {
                        setDialogActiveIndex(1);
                        setVisibleDialogExpense(true);
                    }
                }
            ]
        },
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => {
                navigate(`${INIT_PATH}/profile`);
            },
        }
    ];

    const end = (
        <div className="d-flex align-items-center gap-2">
            <Avatar
                image={profilePic ? profilePic : ""}
                icon="pi pi-user"
                shape="circle"
                onClick={() => setVisibleSidebar(true)}
            />
        </div>
    );

    return (
        <>
            {/* Third */}
            <div className='card' style={{ position: 'sticky', top: '0', zIndex: 2 }}>
                <Menubar model={items} end={end} />
                <SidebarView
                    visibleSidebar={visibleSidebar}
                    setVisibleSidebar={setVisibleSidebar}
                    userData={userData}
                    setDialogActiveIndex={setDialogActiveIndex}
                    setVisibleDialogExpense={setVisibleDialogExpense}
                    position='right'
                />

            </div>

        </>
    )

}

export default Navbar;