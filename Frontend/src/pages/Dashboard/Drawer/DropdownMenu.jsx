import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store";
import { logoutUser } from "../../../actions/authActions";
import { setAudioOnlyRoom } from "../../../actions/roomActions";
import RoomParticipantsDialog from "./RoomParticipantsDialog";
import {
  askPermission,
  subscribeUserToPush,
  unsubscribeUserToPush,
} from "../../../notifications";
import { HiDotsVertical } from "react-icons/hi";
import { Switch } from "@headlessui/react";

export default function DropDownMenu() {
  const [checked, setChecked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const dispatch = useDispatch();

  const {
    auth: { userDetails },
    room: { audioOnly, roomDetails, isUserInRoom },
  } = useAppSelector((state) => state);

  const handleClickLogout = () => {
    dispatch(logoutUser());
    setOpenMenu(false);
  };

  const handleAudioOnlyChange = () => {
    dispatch(setAudioOnlyRoom(!audioOnly));
    setOpenMenu(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setOpenMenu(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleToggleNotification = (enabled) => {
    if (enabled) {
      askPermission().then((result) => {
        if (result) {
          subscribeUserToPush(() => {
            setChecked(true);
          });
        } else {
          alert(
            "Can't turn on notifications. Please enable notifications from browser settings first."
          );
        }
      });
    } else {
      unsubscribeUserToPush(() => {
        setChecked(false);
      });
    }
  };

  useEffect(() => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((existingSubscription) => {
        if (Notification.permission === "granted" && existingSubscription) {
          setChecked(true);
        } else {
          setChecked(false);
        }
      });
    });
  }, []);

  return (
    <div className="relative ml-5 text-white">
      <button
        onClick={() => setOpenMenu((prev) => !prev)}
        className="text-white hover:text-indigo-400"
      >
        <HiDotsVertical size={24} />
      </button>

      {openMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded shadow-md z-50">
          <button
            onClick={handleAudioOnlyChange}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {audioOnly
              ? "Audio Only Enabled (for Rooms)"
              : "Audio Only Disabled (for Rooms)"}
          </button>

          {isUserInRoom && roomDetails && (
            <button
              onClick={handleOpenDialog}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Active Room ({roomDetails.roomCreator.username})
            </button>
          )}

          <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
            <span>Notifications</span>
            <Switch
              checked={checked}
              onChange={handleToggleNotification}
              className={`${
                checked ? "bg-indigo-600" : "bg-gray-300"
              } relative inline-flex h-5 w-10 items-center rounded-full transition`}
            >
              <span
                className={`${
                  checked ? "translate-x-5" : "translate-x-1"
                } inline-block h-3 w-3 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>

          <button
            onClick={handleClickLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Logout ({userDetails?.username})
          </button>
        </div>
      )}

      {roomDetails && userDetails && (
        <RoomParticipantsDialog
          isDialogOpen={isDialogOpen}
          closeDialogHandler={handleCloseDialog}
          roomDetails={roomDetails}
          currentUserId={userDetails._id}
        />
      )}
    </div>
  );
}
