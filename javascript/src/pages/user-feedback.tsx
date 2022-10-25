import UserFeedbackForm from "../forms/user-feedback-form";
import React from "react";
import config from "../config";

export default function UserFeedback() {
    return (
        <div className="container mx-auto">
            <div className="p-5 text-left rounded-xl bg-white my-5 shadow-2xl">
                <UserFeedbackForm destinationURL={config.api.url}/>
            </div>
        </div>
    )
}