import { AxiosRequestConfig } from 'axios';
import { REACT_APP_API_URL } from 'config';
import {
  useAxiosDelete,
  useAxiosGet,
  useAxiosPatch,
  useAxiosPost,
} from 'hooks/useAxios';
import _ from 'lodash';

export const useFetchBoardCardApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();

  const getCards = async (url: string, data?: Object) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, { params: data });
    return resp;
  };

  return { getCards, isError, isLoading, isSuccess };
};

export const useFetchProjectCardApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();

  const getProjectCardDetail = async (
    url: string,
    data?: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const queryString: string[] = [];

    if (data) {
      Object.entries(data).forEach((curr) => {
        if (curr[1] !== '' && curr[1]) {
          queryString.push(curr.join('='));
        }
      }, '');
    }
    const resp = await callApi(
      `${REACT_APP_API_URL}${url}?${queryString.join('&').toString()}`,
      config
    );
    return resp;
  };

  return { getProjectCardDetail, isError, isLoading, isSuccess };
};

export const useFetchUserApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosGet();

  const getUsers = async (
    data?: {
      role?: string;
      search?: string;
    },
    config: AxiosRequestConfig<object> = {}
  ) => {
    const queryString: string[] = [];

    if (data) {
      Object.entries(data).forEach((curr) => {
        if (!_.isEmpty(curr[1])) queryString.push(curr.join('='));
      }, '');
    }

    const resp = await callApi(
      `${REACT_APP_API_URL}/users?${queryString.join('&').toString()}`,
      config
    );
    return resp;
  };

  return { getUsers, isError, isLoading, isSuccess };
};

export const useCreateLabelApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();

  const createNewLabel = async (
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const response = await callApi(`${REACT_APP_API_URL}/label`, data, config);
    return response;
  };

  return { createNewLabel, isError, isLoading, isSuccess };
};

export const useCreateActivityDescriptionApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();

  const createNewActivityDescription = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const response = await callApi(`${REACT_APP_API_URL}/${url}`, data, config);
    return response;
  };

  return { createNewActivityDescription, isError, isLoading, isSuccess };
};

export const useCardPatchApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPatch();
  const updateCardPatch = async (
    url: string,
    data?: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    if (data) {
      const resp = await callApi(`${REACT_APP_API_URL}${url}`, data, config);
      return resp;
    }
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, config);
    return resp;
  };

  return { updateCardPatch, isError, isLoading, isSuccess };
};

export const useCardAttachApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosPost();

  const cardAttach = async (
    url: string,
    data: object,
    config: AxiosRequestConfig<object> = {}
  ) => {
    const response = await callApi(`${REACT_APP_API_URL}/${url}`, data, config);
    return response;
  };

  return { cardAttach, isError, isLoading, isSuccess };
};

export const useDeleteApi = () => {
  const [callApi, { isLoading, isError, isSuccess }] = useAxiosDelete();
  const deleteApi = async (url: string, config: AxiosRequestConfig<object> = {}) => {
    const resp = await callApi(`${REACT_APP_API_URL}${url}`, config);
    return resp;
  };

  return { deleteApi, isError, isLoading, isSuccess };
};
