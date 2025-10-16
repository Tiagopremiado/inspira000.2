
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-blue-500' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    
    return (
        <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${color}`} />
    );
};

export default Spinner;
