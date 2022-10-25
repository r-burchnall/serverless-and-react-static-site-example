import React from "react";
import classNames from "classnames";

interface Props {
    className?: string;
    value?: string;
    type?: "text" | "number" | "password"
    onChange?: (value: string) => void
    error?: boolean
    message?: string
    label?: string
}

export default function InputField({
                                        label,
                                       value,
                                       className = "input",
                                       type = "text",
                                       error = false,
                                       message = "",
                                       onChange
                                   }: Props) {
    return (
        <div className={className}>
            {label && <div>{label}</div>}
            <input
                className={classNames('input-field w-full border rounded p-3', {
                    'border-red-500': error,
                    'border-black': !error,
                })}
                value={value}
                type={type}
                onChange={(e) => onChange && onChange(e.target.value)}
            />
            {message && <div className={classNames({
                'text-red-500': error,
                'text-black': !error
            })}>
                {message}
            </div>}
        </div>
    )
}