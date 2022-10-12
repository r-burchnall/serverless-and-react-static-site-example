import React, {useState} from "react";
import InputField from "../common/form-components/InputField";
import TextArea from "../common/form-components/TextArea";
import axios from "axios";
import classNames from "classnames";

interface Props {
    destinationURL: string
}

export default function UserFeedbackForm({destinationURL}: Props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [feedback, setFeedback] = useState('')

    const defaultErrorState = {
        name: "",
        email: "",
    }
    const [errors, setErrors] = useState(defaultErrorState)
    const [formError, setFormError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    function handleSubmit() {
        // Reset on form submission
        setErrors(defaultErrorState);
        setFormError(false);

        let failedValidation = false;
        if (name.length > 3) {
            setErrors(prevState => ({
                ...prevState,
                name: 'expected name to be greater than 3 characters'
            }))
            failedValidation = true;
        }

        if (email.length > 3) {
            setErrors(prevState => ({
                ...prevState,
                email: "invalid email address"
            }))
            failedValidation = true;
        }

        if (failedValidation) {
            return
        }

        setLoading(true)
        axios.post(destinationURL, {
            name,
            email,
            feedback
        }).then((res) => {
            if (res.status === 200) {
                setMessage('Feedback submitted successfully')
            }
        }).catch((e) => {
            setFormError(true)
            setMessage('Someting went wrong submitting feedback')
        }).then(_ => {
            setLoading(false)
        })
    }

    return (
        <div className="feedback-form flex flex-col gap-3 text-left">
            <h2 className={'text-2xl'}>User Feedback Form</h2>
            <InputField
                value={name}
                onChange={setName}
                label={'Name'}
                error={errors.name != ""}
                message={errors.name}
            />
            <InputField value={email} onChange={setEmail} label={'Email'}/>
            <TextArea value={feedback} onChange={setFeedback}/>
            {
                message && <div className={classNames({
                    'text-red-500': formError,
                })}>
                    {message}
                </div>
            }
            <button
                className={'bg-blue-500 text-white font-bold rounded p-3'}
                onClick={() => handleSubmit()}
                disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </div>
    )
}