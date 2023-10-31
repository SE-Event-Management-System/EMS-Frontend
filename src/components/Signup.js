import { useState } from 'react';
import axios from 'axios';
import { signupFields } from "../constants/formFields"
import FormAction from "./FormAction";
import Input from "./Input";
import { useNavigate } from 'react-router-dom';
import useAuth from '../helpers/useAuth';

const fields=signupFields;
let fieldsState={};

fields.forEach(field => fieldsState[field.id]='');

export default function Signup(){
  const [signupState,setSignupState]=useState(fieldsState);
  const [alert, setAlert] = useState('');

  const navigate = useNavigate();

    const {isLoggedIn, decodedToken } = useAuth();
    if(isLoggedIn){
        navigate('/');
        return;
    }

  const handleChange=(e)=>setSignupState({...signupState,[e.target.id]:e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (signupState.password !== signupState.confirmPassword) {
      setAlert('Passwords do not match');
      return; // Do not proceed with the API call
    }

    setAlert(''); // Clear the error message
    createAccount(signupState);
  };

  //handle Signup API Integration here
  const createAccount = (data) => {
    // Define the API endpoint for your signup request
    const endpoint = 'https://idjexfzucg.execute-api.us-east-2.amazonaws.com/api/v1/signup'; // Replace with your actual endpoint
    
    const postData = {
      requestId: String(Date.now()),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.emailAddress,
      password: data.password
    }

    const headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000/',
        'Access-Control-Allow-Credentials': true,
        'content-type': 'application/json'
      }

    // Make a POST request to the API with the signup data
    axios.post(endpoint, postData, {headers})
      .then((response) => {
        // Handle the successful response
        navigate('/login')
        // You can perform additional actions after a successful signup, such as redirecting the user.
      })
      .catch((error) => {
        // Handle any errors
        setAlert(error.response?.data?.info.displayText || 'Something went wrong');
        console.error('Signup failed', error);
        // You can show an error message to the user or perform error handling.
      });
  };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {alert && (
              <p className="text-red-600 text-center">{alert}</p>
            )}
          <div className="">
            {
            fields.map((field) => (
              <Input
                key={field.id}
                handleChange={handleChange}
                value={signupState[field.id]}
                labelText={field.labelText}
                labelFor={field.labelFor}
                id={field.id}
                name={field.name}
                type={field.type}
                isRequired={field.isRequired}
                placeholder={field.placeholder}
              />
            ))
          }
            <FormAction handleSubmit={handleSubmit} text="Signup" />
          </div>
        </form>
  );
}