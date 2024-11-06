import { Axios } from 'base-axios';
import { addData, DBStores, getData, removeData } from 'services/indexDB.service';

const currentFetchingPaths: Array<string> = [];
interface ParamsType {
  keyPath: string;
  height?: number;
  width?: number;
  image: boolean;
}

const getAlreadyFetchedPath = async (path: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getPresignedImageUrl(path)), 300);
  });
};

const getAWSPresignedUrlServer = async (data: ParamsType) => {
  const { keyPath, image, height, width } = data;

  let params: ParamsType = { keyPath, image };

  if (height && width) {
    params = {
      ...params,
      height,
      width,
    };
  }
  try {
    let path = keyPath;
    if (image) {
      const getWidth = width ? `/${height}*${width}` : '';
      path = `${keyPath}${height && getWidth}`;
    }
    currentFetchingPaths.push(path);
    const pathInfo = await Axios.get('/files', {
      params,
    });
    return pathInfo;
  } catch (error) {
    return null;
  } finally {
    let path: string;
    if (image) {
      const getWidths = height && width ? `/${height}*${width}` : '';
      path = `${keyPath}${getWidths}`;
    } else path = keyPath;
    currentFetchingPaths.splice(currentFetchingPaths.indexOf(path), 1);
  }
};

export const getPresignedImageUrl = async (
  keyPath: string,
  height?: number,
  width?: number,
  image = false,
  caching = true
) => {
  if (!keyPath) {
    return '';
  }
  const heightWidth = height && width ? `/${height}*${width}` : '';
  const path = `${keyPath}${heightWidth}`;
  const data = await getData(DBStores.FILES, path);
  const currentTs = Math.floor(Date.now() / 1000);

  if (data && currentTs <= data.expiresIn && caching) {
    return data.url;
  }

  const isExpired = data && currentTs > data.expiresIn;
  if (isExpired) {
    await removeData(DBStores.FILES, keyPath);
  }

  const isAlreadyFetching = currentFetchingPaths.includes(keyPath);

  if (!isAlreadyFetching) {
    const response = await getAWSPresignedUrlServer({
      keyPath,
      height,
      width,
      image,
    });

    if (response?.data) {
      const { url, expiresIn: expire } = response.data;

      const expInSeconds = Math.floor(Date.now() / 1000) - 5 * 60;
      const expiresIn = expInSeconds + Number(expire);

      const fileInfo = { path, url, expiresIn };

      if (caching) {
        await addData(DBStores.FILES, fileInfo);
      }
      return fileInfo.url;
    }
    return '';
  }

  return getAlreadyFetchedPath(keyPath);
};
