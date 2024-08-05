import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { GlobalDataContext } from '../App';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { Sidebar } from 'primereact/sidebar';
import { Divider } from 'primereact/divider';

function SidebarView({ visibleSidebar, setVisibleSidebar, userData, setDialogActiveIndex, setVisibleDialogExpense, position }) {
    const navigate = useNavigate();
    const { INIT_PATH } = useContext(GlobalDataContext);
    const [username, setUsername] = useState(userData['name'] || null);
    const [profilePic, setProfilePic] = useState(userData.profilePic || null);

    useEffect(function () {
        setUsername(userData['name'] || null);
        setProfilePic(userData.profilePic || null);
    }, [userData]);

    const sidebarItems = [
        {
            label: "Explore",
            items: [
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
            ]
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
            label: "Account",
            items: [
                {
                    label: 'Profile',
                    icon: 'pi pi-user-edit',
                    command: () => {
                        navigate(`${INIT_PATH}/profile`);
                    }
                },
            ]
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            url: `${INIT_PATH}/logout`
        }
    ]

    const sidebarHeader = (
        <div className="d-flex align-items-center gap-2">
            <Avatar
                image={profilePic ? profilePic : ""}
                icon="pi pi-user"
                shape="circle"
            />
            <span className="font-bold">{username ? username : 'Not found'}</span>
        </div>
    );

    return (
        <>
            <Sidebar visible={visibleSidebar} onHide={() => setVisibleSidebar(false)} position={position} header={sidebarHeader}>
                <Divider className='p-0 m-0' />
                <Menu model={sidebarItems} style={{ border: 'none', width: '100%' }} />
            </Sidebar>
        </>
    );

}

export default SidebarView;