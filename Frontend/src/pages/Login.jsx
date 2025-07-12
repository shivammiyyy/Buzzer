import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../store";
import { loginUser } from "../actions/authActions";
import { validateLoginForm } from "../utils/validators";
import AuthBox from "../components/AuthBox"; // This should also be Tailwind converted if using MUI inside
import clsx from "clsx";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isFormValid, setIsFormValid] = useState(false);

  const { error, errorMessage, userDetails } = useAppSelector(
    (state) => state.auth
  );

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    dispatch(loginUser(credentials));
  };

  useEffect(() => {
    setIsFormValid(validateLoginForm(credentials));
  }, [credentials]);

  useEffect(() => {
    if (userDetails?.token) {
      navigate("/dashboard");
    }
  }, [userDetails, navigate]);

  return (
    <AuthBox>
      <h2 className="text-white text-2xl font-semibold">Welcome Back!</h2>
      <p className="text-gray-400">Happy to see you again!</p>

      <div className="flex flex-col w-full mt-4">
        <label className="text-gray-400 uppercase font-semibold text-sm mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className="bg-[#35393f] text-gray-200 border border-black rounded px-2 py-2 text-sm outline-none"
        />
      </div>

      <div className="flex flex-col w-full mt-4">
        <label className="text-gray-400 uppercase font-semibold text-sm mb-1">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="bg-[#35393f] text-gray-200 border border-black rounded px-2 py-2 text-sm outline-none"
        />
      </div>

      <div
        className="w-full mt-6"
        title={
          isFormValid
            ? "Proceed to Login"
            : "Enter correct email address and password should be greater than six characters"
        }
      >
        <button
          onClick={handleLogin}
          disabled={!isFormValid}
          className={clsx(
            "w-full h-10 text-white font-medium text-base rounded",
            isFormValid ? "bg-[#5865F2] hover:bg-[#4752c4]" : "bg-gray-500 cursor-not-allowed"
          )}
        >
          Log In
        </button>
      </div>

      <p className="text-gray-500 text-sm mt-4">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-[#00AFF4] font-medium cursor-pointer"
        >
          Register here
        </span>
      </p>
    </AuthBox>
  );
};

export default Login;
