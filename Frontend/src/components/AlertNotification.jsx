import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { hideAlert } from "../actions/alertActions";
import { useAppSelector } from "../store";

const AlertNotification = () => {
  const dispatch = useDispatch();
  const { open, message } = useAppSelector((state) => state.alert);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        dispatch(hideAlert());
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [open, dispatch]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-100 text-blue-800 border border-blue-300 px-4 py-2 rounded-md shadow-lg text-sm font-medium transition-opacity duration-300 animate-fade-in-out">
        {message}
      </div>
    </div>
  );
};

export default AlertNotification;
