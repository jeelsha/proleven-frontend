import { IGetScreenType } from './types';

const getDeviceType = (userAgent: string) => {
  if (userAgent.includes('iPhone')) {
    return 'ios';
  }
  if (userAgent.includes('Android')) {
    return 'android';
  }
  return '';
};

const getBrowserName = ({ userAgent, device }: IGetScreenType) => {
  if (userAgent.match(/chrome|chromium/i)) {
    return window.navigator && 'brave' in window.navigator
      ? `brave ${device}`
      : `chrome ${device}`;
  }
  if (userAgent.match(/firefox|fxios/i)) {
    return `firefox ${device}`;
  }
  if (userAgent.match(/safari/i)) {
    return `safari ${device}`;
  }
  if (userAgent.match(/opr\//i)) {
    return `opera ${device}`;
  }
  if (userAgent.match(/edg/i)) {
    return `edge ${device}`;
  }
  if (window.navigator && 'brave' in window.navigator) {
    return `brave ${device}`;
  }
  return 'No browser detection';
};

export const useGetScreenType = () => {
  if (typeof window !== 'undefined') {
    const { userAgent } = navigator;
    const device = getDeviceType(userAgent);
    const browserName = getBrowserName({ userAgent, device });

    const nextElement = document.getElementById('__next');
    if (nextElement) {
      nextElement.className = browserName;
    }

    return { browserName, device };
  }
};
