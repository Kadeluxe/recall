import net, {AddressInfo} from "net";

export const getSocketRemoteAddress = (socket: net.Socket) => `${socket.remoteAddress}:${socket.remotePort}`;
export const getServerLocalAddress = (server: net.Server) => `${(server.address() as AddressInfo).address}:${(server.address() as AddressInfo).port}`;
