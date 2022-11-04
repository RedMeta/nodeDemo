import io from "socket.io";

export const PORT: number = parseInt(process.env.PORT) || 8008;

export const server = new io.Server({ path: "/socket" });
