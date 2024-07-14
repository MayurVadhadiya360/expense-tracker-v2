const togglePasswordState = (toggleIconElement, passwordRef) => {
    if (passwordRef.current) {
        const tagType = passwordRef.current.getElement().childNodes[0].type;
        if (tagType === 'text') {
            toggleIconElement.classList.add('pi-eye');
            toggleIconElement.classList.remove('pi-eye-slash');
        }
        else if (tagType === 'password') {
            toggleIconElement.classList.remove('pi-eye');
            toggleIconElement.classList.add('pi-eye-slash');
        }
        passwordRef.current.toggleMask();
    }
}

const getEmailRegex = () => {
    const emailRegex = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    return emailRegex;
}

const getPasswordRegex = () => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/;
    return passwordRegex;
}

export { togglePasswordState, getEmailRegex, getPasswordRegex };