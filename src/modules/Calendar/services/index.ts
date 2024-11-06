import { AxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from 'config';
import { useAxiosGet, useAxiosPost } from 'hooks/useAxios';

export const useCalendarGetApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();
  const calendarGetApi = async (
    url: string,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, config);
    return resp;
  };

  return { calendarGetApi, isError, isLoading, isSuccess };
};

export const useCalendarCreateEventApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();
  const createEventApi = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { createEventApi, isError, isLoading, isSuccess };
};
