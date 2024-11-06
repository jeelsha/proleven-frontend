import { AxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useAxiosDelete, useAxiosGet, useAxiosPost } from 'hooks/useAxios';

// Account settings services

export const useConnectAccountApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();
  const accountGetApi = async (
    url: string,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, config);
    return resp;
  };

  return { accountGetApi, isError, isLoading, isSuccess };
};

export const useConnectAccountDeleteApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosDelete();
  const accountDeleteApi = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { accountDeleteApi, isError, isLoading, isSuccess };
};

// change password services

export const useChangePasswordApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();

  const changePasswordApi = async (
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const response = await callApi(
      `${REACT_APP_API_URL}/auth/change-password`,
      data,
      config
    );
    return response;
  };

  return { changePasswordApi, isError, isLoading, isSuccess };
};

export const useProfileViewApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();
  const profileGetApi = async (
    url: string,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, config);
    return resp;
  };

  return { profileGetApi, isError, isLoading, isSuccess };
};
