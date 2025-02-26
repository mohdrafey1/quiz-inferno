import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    className,
    ...props
}) => {
    return (
        <button
            className={`px-4 py-2 rounded-md font-medium ${
                variant === 'primary'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-black'
            } ${className}`}
            {...props}
        />
    );
};
