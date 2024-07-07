function validate_email(email, errorMsgTag) {
    if (email.length === 0) {
        errorMsgTag.style.color = "red";
        errorMsgTag.innerHTML = "Email Required";
        setTimeout(() => {
            errorMsgTag.innerHTML = "";
        }, 2000)
        return false;
    }
    else if (email.match(/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)) {
        errorMsgTag.innerHTML = "";//"Validation Successfull";
        return true;
    }
    else {
        errorMsgTag.style.color = "red";
        errorMsgTag.innerHTML = "Email Invalid";
        return false;
    }
}

function validate_password(password, errorMsgTag) {
    if (password.length === 0) {
        errorMsgTag.innerHTML = "Password required";
        setTimeout(() => {
            errorMsgTag.innerHTML = "";
        }, 2000)
        return false;
    }
    else if (password.length < 8) {
        errorMsgTag.style.color = "red";
        errorMsgTag.innerHTML = "Password must be at least 8 characters";
        setTimeout(() => {
            errorMsgTag.innerHTML = "";
        }, 2000)
        return false;
    }
    else if (password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/)) {
        errorMsgTag.innerHTML = "";//"Validation Successfull";
        return true;
    }
    else {
        errorMsgTag.style.color = "red";
        errorMsgTag.innerHTML = "Password requirements: 1 capital, 1 special, 1 number, 8-32 characters";
        return false;
    }
}

export { validate_email, validate_password };
