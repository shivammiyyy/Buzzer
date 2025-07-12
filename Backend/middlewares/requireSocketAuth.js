import jwt from "jsonwebtoken";

const config = process.env;

const requireSocketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    const error = new Error("A token is required for authentication");
    error.status = 403;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = decoded;
  } catch (err) {
    const error = new Error("403, Not authorized");
    error.status = 403;
    return next(error);
  }

  return next();
};

export default requireSocketAuth;
