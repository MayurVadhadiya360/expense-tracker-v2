import React, { useContext, useState, useEffect } from 'react';
import { GlobalDataContext } from '../App';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const CategoryList = ({ listHeight = '6rem', isDeletable = false }) => {
    const { API_URL, categories, categorySeverity, setToastMsg, fetchCategoryData } = useContext(GlobalDataContext);

    const elementLoading = (elementId, isLoading) => {
        const ele = document.getElementById(elementId);
        if (isLoading) {
            ele.classList.add('pi-spin', 'pi-spinner');
            ele.classList.remove('pi-times');
        }
        else {
            ele.classList.add('pi-times');
            ele.classList.remove('pi-spin', 'pi-spinner');
        }

    };
    const deleteCategory = (category) => {
        elementLoading(`category-${category}`, true);
        fetch(`${API_URL}/delete_category/`, {
            method: 'DELETE',
            headers: { 'accept': 'application.json', 'content-type': 'application/json' },
            body: JSON.stringify({ 'category': category }),
            cache: 'default',
        }).then(res => res.json())
            .then(
                (result) => {
                    elementLoading(`category-${category}`, false);
                    if (result.status) {
                        setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 3000 });
                        fetchCategoryData();
                    }
                    else {
                        setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                    }
                },
                (error) => {
                    console.error(error);
                    elementLoading(`category-${category}`, false);
                    setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
                }
            )
    }
    return (
        <div className='m-2 row category-list-container' style={{ height: listHeight }}>
            {categories.map((category, index) => (
                <div key={index} className='col m-1 p-0 d-flex justify-content-center align-items-center'>
                    <Tag severity={categorySeverity[category]} className='category-list-tag'  >
                        <div className="d-flex align-items-center gap-2">
                            <span className="text-base">{category}</span>
                            {
                                isDeletable &&
                                <i id={`category-${category}`} className="pi pi-times" style={{ cursor: 'pointer' }} onClick={(e) => { deleteCategory(category) }}></i>
                            }
                        </div>
                    </Tag>
                </div>
            ))}
        </div>
    );
};

function AddCategory({ header = true, listHeight = '6rem', isDeletable = false }) {
    const { API_URL } = useContext(GlobalDataContext);
    const { setCategories, setToastMsg } = useContext(GlobalDataContext);

    // Field for new category
    const [newCategory, setnewCategory] = useState('');

    // For validating input fields
    const [validNewCategory, setValidNewCategory] = useState(true);

    // loading state
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [spinClass, setSpinClass] = useState('');

    useEffect(() => {
        setValidNewCategory((newCategory === '' && newCategory === null) ? false : true);
    }, [newCategory]);

    // For adding new category
    const addNewCategory = () => {
        if (validNewCategory) {
            setLoadingCategory(true); // showing loader
            setSpinClass('pi-spin'); // for spinning

            fetch(`${API_URL}/add_category/`, {
                method: 'POST',
                headers: {
                    'accept': 'application.json',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ 'category': newCategory }),
                cache: 'default',
            }).then(res => res.json())
                .then(
                    (result) => {
                        if (result.status) {
                            setCategories(prevCategories => [...prevCategories, newCategory]);
                            setToastMsg({ severity: 'success', summary: 'Success', detail: result.msg, life: 3000 });
                            setnewCategory("");
                        }
                        else {
                            setToastMsg({ severity: 'error', summary: 'Error', detail: result.msg, life: 3000 });
                        }
                        setLoadingCategory(false);
                        setSpinClass('');
                    },
                    (error) => {
                        console.error(error);
                        setToastMsg({ severity: 'error', summary: 'Error', detail: "Functional error!", life: 3000 });
                        setLoadingCategory(false);
                        setSpinClass('');
                    }
                )
        }
    };


    return (
        <>
            {console.log('- add category')}

            {
                header &&
                <>
                    <div className='d-flex justify-content-center header-p' >
                        <h3 >Add Category</h3>
                    </div>
                    <hr className='m-0' />
                </>
            }
            <div className="card flex fles-column mt-1">
                <CategoryList listHeight={listHeight} isDeletable={isDeletable} />
                <div className='m-2 p-inputgroup flex-1' style={{ width: 'auto' }}>

                    <InputText
                        type='text'
                        value={newCategory}
                        onChange={(e) => setnewCategory(e.target.value)}
                        placeholder="Enter Category"
                        invalid={!validNewCategory}
                        variant="filled"
                    />
                    <Button
                        icon={`pi pi-check ${spinClass}`}
                        onClick={addNewCategory}
                        loading={loadingCategory}
                        className="p-button-success"
                        style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                    />
                </div>
            </div>
        </>
    )
}

export default AddCategory;