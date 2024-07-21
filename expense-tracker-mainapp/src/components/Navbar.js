import React, { useContext, useState, useEffect } from 'react'
import { GlobalDataContext } from '../App';
import { useNavigate } from "react-router-dom";
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { Menubar } from 'primereact/menubar';
import { Sidebar } from 'primereact/sidebar';
import { Divider } from 'primereact/divider';


function Navbar(props) {
    const navigate = useNavigate();
    const { API_URL, INIT_PATH, setVisibleDialogExpense, setDialogActiveIndex, setToastMsg } = useContext(GlobalDataContext);
    const [visibleSidebar, setVisibleSidebar] = useState(false);
    const [userData, setUserData] = useState({});

    const getUserData = () => {
        fetch(`${API_URL}/get_user/`)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result.status) {
                        setUserData(result.user_data);
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Error', detail: 'Failed to get user!', life: 3000 });
                    }
                },
                (error) => {
                    console.error(error);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
                }
            );
    }

    useEffect(() => {
        getUserData();
        // eslint-disable-next-line
    }, []);

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
                    label: 'Add Category',
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
            command: () => setVisibleSidebar(true),
        }
    ];

    const sidebarItems = [
        {
            label: 'Change username',
            icon: 'pi pi-user-edit',
            command: () => {
                setToastMsg({ severity: 'info', summary: 'Info', detail: "Coming soon!", life: 3000 })
            }
        },
        {
            label: 'Change profile picture',
            icon: 'pi pi-pen-to-square',
            command: () => {
                setToastMsg({ severity: 'info', summary: 'Info', detail: "Coming soon!", life: 3000 })
            }
        },
        {
            label: 'Change password',
            icon: 'pi pi-lock',
            command: () => {
                setToastMsg({ severity: 'info', summary: 'Info', detail: "Coming soon!", life: 3000 })
            }
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            url: '/logout'
        }
    ]


    const end = (
        <div className="d-flex align-items-center gap-2">
            <Avatar
                // image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                icon="pi pi-user"
                shape="circle"
                onClick={() => setVisibleSidebar(true)}
            />
        </div>
    );

    const sidebarHeader = (
        <div className="d-flex align-items-center gap-2">
            <Avatar
                // image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                icon="pi pi-user"
                shape="circle"
            />
            <span className="font-bold">{userData['name'] ? userData['name'] : 'Not found'}</span>
        </div>
    );

    return (
        <>
            {console.log('- navbar')}

            {/* Third */}
            <div className='card'>
                <Menubar model={items} end={end} />

                <Sidebar visible={visibleSidebar} onHide={() => setVisibleSidebar(false)} position='right' header={sidebarHeader}>
                    {/* <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat.
                    </p> */}
                    <Divider className='p-0 m-0' />
                    <Menu model={sidebarItems} style={{ border: 'none', width: '100%' }} />
                </Sidebar>
            </div>

        </>
    )

}

export default Navbar;