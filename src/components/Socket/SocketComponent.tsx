import { REACT_APP_API_BASE_URL } from 'config';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSocket, socketSelector } from 'redux-toolkit/slices/socketSlice';
import { getAuthToken } from 'redux-toolkit/slices/tokenSlice';
import openSocket from 'socket.io-client';

// ** constants **
import { socketName } from 'constants/common.constant';
import { PUBLIC_NAVIGATION } from 'constants/navigation.constant';
import { socketProject } from 'modules/ProjectManagement_module/enum';

const SocketComponent = () => {
  const dispatch = useDispatch();
  const socket = useSelector(socketSelector);
  const token = useSelector(getAuthToken);

  socket?.on(socketName.NEW_ROOM, (data) => {
    socket.emit(socketName.JOIN_ROOM, data);
  });

  socket?.emit(socketProject.JOIN_PROJECT_MANAGEMENT_BOARD);
  socket?.emit(socketProject.JOIN_COURSE_MANAGEMENT_BOARD);

  const connectSocket = async () => {
    const url = REACT_APP_API_BASE_URL;
    const socket = openSocket(url as string, {
      forceNew: true,
      transports: ['websocket'],
      query: {
        ...token,
      },
    });
    dispatch(setSocket(socket));
  };

  useEffect(() => {
    if (
      token &&
      !window.location.href.includes(PUBLIC_NAVIGATION.somethingWentWrong)
    ) {
      connectSocket();
    }
  }, []);

  return <></>;
};
export default SocketComponent;
