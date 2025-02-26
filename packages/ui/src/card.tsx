import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
    return (
        <div className="border-2 rounded-lg shadow-md p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            {children}
        </div>
    );
};
