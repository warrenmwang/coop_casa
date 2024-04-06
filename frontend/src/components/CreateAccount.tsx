import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

const CreateAccountForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', firstName: '', lastName: '', dateOfBirth: '', city: '', state: '', zipcode: '', country: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation logic here for email and password
    // For simplicity, this example does not include detailed validation
    try {
      // console.log('formData:', formData);
      await axios.post('http://localhost:8080/api/createUser', formData);
      alert('Account created successfully. Taking You to Dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating account. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Create a New Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" placeholder="Email" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" id="password" placeholder="Password" required minLength={14} maxLength={30} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input type="text" name="firstName" id="firstName" placeholder="First Name" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input type="text" name="lastName" id="lastName" placeholder="Last Name" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" name="dateOfBirth" id="dateOfBirth" placeholder="Date of Birth" onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <input type="text" name="city" placeholder="City" onChange={handleChange} className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          <input type="text" name="state" placeholder="State" onChange={handleChange} className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          <input type="text" name="zipcode" placeholder="Zipcode" onChange={handleChange} className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          <input type="text" name="country" placeholder="Country" onChange={handleChange} className="col-span-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit</button>
      </form>
    </div>
  );
};

export default CreateAccountForm;