import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectWithSocketServer} from "../../socket/socketConnection";
import { useAppSelector } from "../../store";
import ResponsiveDrawer from "./Drawer";

const Dashboard = () => {
  const {
    auth: { userDetails },
    videoChat: { localStream },
    room: { isUserInRoom, localStreamRoom },
  } = useAppSelector((state) => state);
  
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = userDetails?.token;

    if (!isLoggedIn) {
      navigate("/login");
    } else {
      connectWithSocketServer(userDetails);
    }
  }, [userDetails, navigate]);

  return (
    <div className="w-full h-screen flex">
      <ResponsiveDrawer
        localStream={localStream || localStreamRoom}
        isUserInRoom={isUserInRoom}
      />
    </div>
  );
};

export default Dashboard;
