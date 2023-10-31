import React, { useState, useEffect } from 'react';
import useAuth from '../helpers/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const Navbar = () => {
  const [showNav, setShowNav] = useState(false);
  const [isCrossButton, setIsCrossButton] = useState(false);
  const { isLoggedIn, decodedToken } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleNav = () => {
    setShowNav(!showNav);
    setIsCrossButton(!isCrossButton);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/')
  };

  useEffect(() => {
    const isScreenLarge = () => {
      return window.matchMedia("(min-width: 1024px)").matches;
    };

    const closeNavOnLargeScreen = () => {
      if (isScreenLarge() && showNav) {
        setShowNav(false);
        setIsCrossButton(false);
      }
    };

    window.addEventListener("resize", closeNavOnLargeScreen);

    return () => {
      window.removeEventListener("resize", closeNavOnLargeScreen);
    };
  }, [showNav]);


  return (
    <nav className="bg-white shadow-lg">
      <div className="container-lg mr-10 ml-5">
        <div className="flex justify-between items-center h-16">
          <div>
            <a href="/" className="text-purple-500 text-2xl font-semibold">
              <img
                alt=""
                className="h-12 w-12"
                src="https://ik.imagekit.io/pibjyepn7p9/Lilac_Navy_Simple_Line_Business_Logo_CGktk8RHK.png?ik-sdk-version=javascript-1.4.3&updatedAt=1649962071315"
              />
            </a>
          </div>
          <div className={`lg:hidden`}>
            <button onClick={toggleNav} className="text-gray-700 hover:text-purple-500">
              {isCrossButton ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" fill="none" stroke="currentColor" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" />
                </svg>
              )}
            </button>
          </div>
          {isLoggedIn ? (
            <div className="relative">
              <ul className='flex justify-around space-x-4'>
                {(location.pathname != '/events') && (<li className='text-lg'><a href="/events" className="text-purple-600 hover:text-purple-500">Events</a></li>)}
                <li className='text-lg'><a href="/reservations" className="text-purple-600 hover:text-purple-500">Reservations</a></li>
                <li onClick={toggleDropdown} className="cursor-pointer">
                <a className="text-purple-600 hover:text-purple-500">{decodedToken.user}</a>
                </li>
                </ul>
              {showDropdown && (
                <div className="absolute top-10 right-0 bg-white border shadow-md rounded-md p-2" style={{ width: '6.5rem' }}>
                  <div className="w-full text-center text-purple-600 hover:text-purple-500 cursor-pointer">
                    <FontAwesomeIcon icon="fa-regular fa-user" />
                    <Link to="/userProfile">
                      Profile
                    </Link>
                    </div>
                  <div className="w-full text-center text-purple-600 hover:text-purple-500 cursor-pointer" onClick={logout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`${showNav ? 'w-full lg:w-auto space-x-4 lg:space-x-0 fixed top-0 left-0 h-screen bg-white z-50' : 'hidden lg:flex'}`}>
              <ul className={`${showNav ? 'flex h-screen justify-center items-center flex-col' : 'flex justify-around space-x-4'}`}>
                <li className='text-lg'><a href="/events" className="text-purple-600 hover:text-purple-500">Events</a></li>
                <li className='text-lg'><a href="/reservations" className="text-purple-600 hover:text-purple-500">Reservations</a></li>
                <li className='text-lg'><a href="/login" className="text-purple-600 hover:text-purple-500">Login</a></li>
                <li className='text-lg'><a href="/signup" className="text-purple-600 hover:text-purple-500">Sign up</a></li>
                {/* <li className='text-lg'><a href="/contact" className="text-purple-600 hover:text-purple-500">Contact</a></li> */}
              </ul>
            </div>
          )}
          {showNav && (
            <div className="lg:hidden fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-40" onClick={toggleNav}></div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
