/*
-------------------------------------HOW-TO-USE-------------------------------------
Validator({
            form: '#form1',
            errSelector: '.form-message',
            formGroupSelector: '.form-group',
            rules: [
                Validator.isRequired('#fullname', 'Please fill this field'),
                Validator.isInteger('#number', 'Please input integer number'),
                Validator.isDouble('#number', 'Please input float number'),
                Validator.isEmail('#email', 'Please fill valid email'),
                Validator.minLength('#password', 6, 'Password must be as least 6 character'),
                Validator.isComfirmed('#passwordAgain', function () {
                    return document.querySelector('#form1 #password').value;
                }, 'Password not same')
            ],
            onSubmit: function(data) {
                console.log(data)
            }
        });
-----------------------------------------------------------------------------------
*/


function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errMess;
        //get error element
        var errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector);
        //get all rule of selector
        var rules = selectorRules[rule.selector];
        //loop through each rule
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errMess = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default: errMess = rules[i](inputElement.value);
                    break;
            }
            //get error message from test function
            if (errMess) {
                break;
            }
        }

        if (errMess) {
            errElement.innerText = errMess;
            //add class invalid to error element
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errMess;
    }
    //get form element
    var formElement = document.querySelector(options.form);
    if (formElement) {

        //listen event on submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(rule => {
                var inputElements = formElement.querySelectorAll(rule.selector);
                Array.from(inputElements).forEach(function (inputElement) {
                    var isValid = validate(inputElement, rule);
                    if (!isValid) {
                        isFormValid = false;
                    }
                })
            });
            if (isFormValid) {
                //case submit with javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = [];
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.file;
                                break;
                            default: values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                } else {
                    formElement.submit();
                }
            }
        }
        //loop throught each rule (listen blur event, input event)
        options.rules.forEach(rule => {
            //get input element
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    //handle blur 
                    inputElement.onblur = function () {
                        //call function validate with parametter are input element and rule
                        validate(inputElement, rule);
                    }
                    //handle input
                    inputElement.oninput = function () {
                        var errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errSelector);
                        errElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            })


        });
    }
}


Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(String(value).toLowerCase()) ? undefined : message || 'Vui lòng nhập email';
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Mật khẩu phải có ít nhất ${min} kí tự`;
        }
    };
}

Validator.isComfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không khớp';
        }
    }
}

Validator.isInteger = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\d+$/;
            return regex.test(String(value).toLowerCase()) ? undefined : message || 'Vui lòng nhập số';
        }
    }
}

Validator.isDouble = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^-?\d+\.?\d*$/;
            return regex.test(String(value).toLowerCase()) ? undefined : message || 'Vui lòng nhập số';
        }
    }
}