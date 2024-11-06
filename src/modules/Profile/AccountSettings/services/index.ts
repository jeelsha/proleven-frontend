import { AxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from 'config';
import { FormikValues } from 'formik';
import { useAxiosGet, useAxiosPost, useAxiosPut } from 'hooks/useAxios';

export const useCreateAcademyApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();
  const createAcademyApi = async (
    url: string,
    data: FormikValues,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { createAcademyApi, isError, isLoading, isSuccess };
};

export const useUpdateAcademyApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPut();
  const updateAcademyApi = async (
    url: string,
    data: FormikValues,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
    return resp;
  };

  return { updateAcademyApi, isError, isLoading, isSuccess };
};

export const useGetAllAcademy = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();
  const getAllAcademy = async (url: string) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`);
    return resp;
  };
  return { getAllAcademy, isError, isLoading, isSuccess };
};
