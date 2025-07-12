import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { registerUser } from "../actions/authActions";
import { validateRegisterForm } from "../utils/validators";
import AuthBox from "../components/AuthBox"; // Make sure this is also converted to Tailwind

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const { userDetails } = useAppSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => {
    dispatch(registerUser(credentials));
  };

  useEffect(() => {
    setIsFormValid(validateRegisterForm(credentials));
  }, [credentials]);

  useEffect(() => {
    if (userDetails?.token) {
      navigate("/dashboard");
    }
  }, [userDetails, navigate]);

  return (
    <AuthBox>
      <h2 className="text-white text-2xl font-semibold mb-1">Welcome!</h2>
      <p className="text-gray-400 mb-4">Create an account to get started.</p>

      {/* Username */}
      <div className="flex flex-col w-full mb-4">
        <label className="text-gray-400 uppercase text-sm font-semibold mb-1">
          Username
        </label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={credentials.username}
          onChange={handleChange}
          className="h-10 px-3 text-sm rounded border border-black bg-[#35393f] text-gray-200 outline-none"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col w-full mb-4">
        <label className="text-gray-400 uppercase text-sm font-semibold mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={credentials.email}
          onChange={handleChange}
          className="h-10 px-3 text-sm rounded border border-black bg-[#35393f] text-gray-200 outline-none"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col w-full mb-4">
        <label className="text-gray-400 uppercase text-sm font-semibold mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={credentials.password}
          onChange={handleChange}
          className="h-10 px-3 text-sm rounded border border-black bg-[#35393f] text-gray-200 outline-none"
        />
      </div>

      {/* Submit Button */}
      <div
        title={
          isFormValid
            ? "Proceed to Register"
            : "Enter correct email address. Password should be greater than six characters and username should be between 3 and 12 characters!"
        }
      >
        <button
          disabled={!isFormValid}
          onClick={handleRegister}
          className={`w-full h-10 text-white text-base font-medium rounded mt-2 ${
            isFormValid
              ? "bg-[#5865F2] hover:bg-[#4752c4]"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Redirect */}
      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <span
          className="text-[#00AFF4] font-medium cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Log In
        </span>
      </p>
    </AuthBox>
  );
};

export default Register;
