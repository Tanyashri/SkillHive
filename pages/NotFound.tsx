
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-center">
            <h1 className="text-6xl font-bold text-primary-500">404</h1>
            <h2 className="text-3xl font-semibold mt-4 text-gray-800 dark:text-gray-200">Page Not Found</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Sorry, the page you are looking for does not exist.</p>
            <Link 
                to="/" 
                className="mt-8 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                Go back to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;
