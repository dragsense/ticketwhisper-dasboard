import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Use NavLink instead of Link
import { Ticket } from 'lucide-react'; // Importing ticket icon from Lucide React
import AuthContext from "../context/AuthContext"; 

const Navbar = () => {
    const { logout } = useContext(AuthContext); // Access the logout function from AuthContext
    const navigate = useNavigate(); // Use navigate for redirecting after logout

    const handleLogout = async () => {
        await logout(); // Call the logout function
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <nav className="bg-purple-600 text-white p-4 flex justify-between items-center">
            {/* Left side - Logo and Title */}
            <div className="flex items-center">
                <Ticket className="w-6 h-6 mr-2" />
                <h1 className="text-lg font-semibold">TicketWispher</h1>
            </div>

            {/* Right side - Menu Links */}
            <ul className="flex space-x-6">
                <li>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => 
                            isActive 
                                ? 'bg-white text-purple-600 px-4 py-2 rounded-md shadow-md hover:text-gray-300' 
                                : 'hover:text-gray-300 px-4 py-2 rounded-md'
                        } 
                        end
                    >
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/websites" 
                        className={({ isActive }) => 
                            isActive 
                                ? 'bg-white text-purple-600 px-4 py-2 rounded-md shadow-md hover:text-gray-300' 
                                : 'hover:text-gray-300 px-4 py-2 rounded-md'
                        } 
                    >
                        Add Websites
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/scrape" 
                        className={({ isActive }) => 
                            isActive 
                                ? 'bg-white text-purple-600 px-4 py-2 rounded-md shadow-md hover:text-gray-300' 
                                : 'hover:text-gray-300 px-4 py-2 rounded-md'
                        } 
                    >
                        Scrape Data
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/users" 
                        className={({ isActive }) => 
                            isActive 
                                ? 'bg-white text-purple-600 px-4 py-2 rounded-md shadow-md hover:text-gray-300' 
                                : 'hover:text-gray-300 px-4 py-2 rounded-md'
                        } 
                    >
                        Manage Users
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        onClick={handleLogout} 
                        className="hover:text-gray-300 focus:outline-none px-4 py-2 rounded-md" // Added styling for logout button
                    >
                        Logout
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
