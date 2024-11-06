import { AxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useAxiosPatch } from 'hooks/useAxios';

export const useUpdateOneNotification = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPatch();
  const updateOneNotification = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { updateOneNotification, isError, isLoading, isSuccess };
};
export const useUpdateAllNotification = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPatch();
  const updateAllNotification = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { updateAllNotification, isError, isLoading, isSuccess };
};
