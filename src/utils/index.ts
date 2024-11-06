/* eslint-disable @typescript-eslint/no-explicit-any */
import { REACT_APP_API_URL } from 'config';
import {
  AllCompanyManagerExportObject,
  AtecoCodeExportObject,
  CodeExportObject,
  CompanyExportObject,
  CompanyManagerAttendeeExportObject,
  CompanyManagerExportObject,
  CourseExportObject,
  PrivateMembersExportObject,
  TrainingSpecialistCourseExportObject,
  UserManagementExportObject,
} from 'constants/ExportDataStructure';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import { decode, encode, isValid } from 'js-base64';
import _, { isNaN } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { currentPageCount } from 'redux-toolkit/slices/paginationSlice';
import sanitizeHtml from 'sanitize-html';
import tlds from 'tlds';
import { RoleFields } from 'types/common';

export interface FilterObject {
  [key: string]: string[];
}

export const logger = (value: { [key: string]: string }) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('error------', value?.message ? value?.message : value);
  }
};

export const encodeToBase64 = (data: string, urlSafe = false) => {
  return encode(data, urlSafe);
};

export const decodeFromBase64 = (data: string) => {
  return isValid(data) ? decode(data) : '';
};

export const isValidBase64 = (data: string) => {
  return isValid(data);
};

// export const parseData = (data: any) => {
//   try {
//     return JSON.parse(data);
//   } catch (e) {
//     return null;
//   }
// };

// export const checkInputIsNumber = (e: any) => {
//   const k = e.which;
//   if ((k < 48 || k > 57) && (k < 96 || k > 105) && k !== 8) {
//     e.preventDefault();
//     return false;
//   }
// };

export const isValidEmail = (v: string | null | undefined) => {
  const tld = (v ?? '').split('.').slice(-1)[0];

  const isValidTLDs = tlds.includes(tld);
  if (!isValidTLDs) {
    return false;
  }
  return true;
};

export const isValidDomain = (input: string | null | undefined) => {
  const tld = (input ?? '').split('.').slice(-1)[0];
  const isValidTLDs = tlds.includes(tld);
  if (input && input.indexOf('@') === -1 && input.indexOf('.') > 0 && isValidTLDs) {
    return true;
  }
  return false;
};

export const isValidDate = (date: string | Date) => {
  if (typeof date === 'string') {
    return (
      Object.prototype.toString.call(new Date(date)).slice(8, -1) === 'Date' &&
      new Date(date)?.toString() !== 'Invalid Date'
    );
  }
  return date instanceof Date && new Date(date)?.toString() !== 'Invalid Date';
};

export const getUrlHostName = (urlString: string) => {
  try {
    const url = new URL(urlString);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.hostname;
    }
  } catch (error) {
    return '';
  }
};

// export const searchItemFromArray = (data: any[], search: string) => {
//   const searchData = data.filter((obj) => {
//     return JSON.stringify(obj?.template_name || '')
//       .toLocaleLowerCase()
//       .includes(search.trim().toString());
//   });
//   if (_.isArray(searchData)) {
//     return searchData;
//   }
//   return [];
// };

export const checkAndReturnActualDateOrTime = (val: string) => {
  const actualDate = format(new Date(val), 'MMM-dd-yyyy');
  const today = format(new Date(), 'MMM-dd-yyyy');
  const currentDateYear = new Date().getFullYear();
  const actualDateYear = new Date(val).getFullYear();

  if (actualDate === today) {
    return format(new Date(val), 'h:mm a');
  }
  if (currentDateYear === actualDateYear) {
    return format(new Date(val), 'dd MMM');
  }
  return actualDate;
};

export const customRandomNumberGenerator = (max?: number | null) => {
  if (max) {
    return Math.floor(Math.random() * max) + 1;
  }
  return Math.floor(Math.random() * 10000000) + 1;
};

export const safeHTML = (string: string, options: sanitizeHtml.IOptions = {}) => {
  const data = sanitizeHtml(string, options);
  return data;
};

export const dasherize = (str: string) => {
  return str
    ?.trim()
    .split(' ')
    .map((value) => value.toLowerCase())
    .join('-');
};

export const convertLocationIdToName = (
  type: string,
  value: string,
  countries: { countries: { id: string; name: string }[] },
  states: { states: { id: string; name: string; country_id: string }[] },
  cities: { cities: { id: string; name: string; state_id: string }[] }
) => {
  switch (type) {
    case 'country':
      return countries.countries.find((obj) => obj.id === value)?.name ?? value;
    case 'state':
      return states.states.find((obj) => obj.id === value)?.name ?? value;
    case 'city':
      return cities.cities.find((obj) => obj.id === value)?.name ?? value;
    default:
      return '';
  }
};

export function formatCount(count: number) {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (value) dispatch(currentPageCount({ currentPage: 1 }));
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue?.trim();
}

export const openAuthWindow = (
  tokenProvider: string,
  URL?: string,
  userId?: string,
  is_default?: boolean
): void => {
  const tokenMapping: Record<string, string> = {
    google_calendar: 'google',
    microsoft_calendar: 'microsoft',
    icalendar: 'icalendar',
  };

  const token: string = tokenMapping[tokenProvider] || 'zoom';

  const authToken: string = window.btoa(
    JSON.stringify({
      userId,
      token_provider: tokenProvider,
      successURL: URL,
      failureURL: URL,
      is_default,
    })
  );

  window.open(
    `${REACT_APP_API_URL}/auth/${token}/connect?token=${authToken}`,
    '_self'
  );
};

export const shouldDisableField = (
  fieldName: string,
  fieldsArray: string[],
  activeLanguage: string,
  defaultLanguage: string
) => {
  if (defaultLanguage === activeLanguage) {
    return false;
  }
  return fieldsArray.indexOf(fieldName) === -1;
};

export const replaceTemplateTagsWithBraces = (htmlContent = '') => {
  return htmlContent.replace(/<%= (.*?) %>/g, '[$1]');
};

export const findBraces = (htmlContent = '', braceStrings = ['']) => {
  const braceCounts: { [key: string]: number } = {};

  braceStrings.forEach((brace) => {
    braceCounts[brace] = (
      htmlContent.match(new RegExp(`\\[${brace}\\]`, 'g')) || []
    ).length;
  });
  return { braceCounts };
};

export const replaceBracesWithTemplateTags = (htmlContent = '') => {
  return htmlContent.replace(/\[(.*?)\]/g, '<%= $1 %>');
};
export const capitalizeFirstCharacter = (inputString: string) => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

export const convertRoleToUrl = (inputString: string) => {
  return inputString
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
    .split(' ')
    .join('-');
};

export const convertRoleUrlToString = (inputString: string) => {
  return inputString.replace('-', ' ');
};

export const convertObjectsToSingleKey = (array: any[]) => {
  const convertedArray: any[] = [];

  const extractData = (developer: any, joinKey = ''): any => {
    const convertedObject: any = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const key in developer) {
      // eslint-disable-next-line no-continue
      if (!Object.prototype.hasOwnProperty.call(developer, key)) continue;

      const newKey = joinKey ? `${joinKey}.${key}` : key;

      if (typeof developer[key] === 'object' && developer[key] !== null) {
        Object.assign(convertedObject, extractData(developer[key], newKey));
      } else {
        convertedObject[newKey] = developer[key];
      }
    }

    return convertedObject;
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const developer of array) {
    convertedArray.push(extractData(developer));
  }

  return convertedArray;
};

export const wait = (ms = 5000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

type IHandleExportType = {
  response?: any;
  exportFor: string;
  currentRole?: RoleFields;
  fileName?: string;
};

const ExportObject = (
  type: string,
  currentRole: RoleFields | undefined,
  t: TFunction<any, undefined>
) => {
  switch (type) {
    case 'managers':
      return CompanyManagerExportObject(t);
    case 'private':
      return PrivateMembersExportObject(t);
    case 'user':
      return UserManagementExportObject(currentRole, t);
    case 'attendee':
      return CompanyManagerAttendeeExportObject(t);
    case 'company':
      return CompanyExportObject(t);
    case 'allManager':
      return AllCompanyManagerExportObject(t);
    case 'codes':
      return CodeExportObject(t);
    case 'acteo-codes':
      return AtecoCodeExportObject(t);
    case 'course':
      return CourseExportObject(t);
    case 'report':
      return TrainingSpecialistCourseExportObject(t);
    default:
      return [];
  }
};

export const useHandleExport = () => {
  const { t } = useTranslation();
  const exportDataFunc = async ({
    response,
    exportFor,
    currentRole,
    fileName,
  }: IHandleExportType) => {
    let jsonData = [];
    if (response) {
      jsonData = convertObjectsToSingleKey(response);
    }
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('New Sheet');

    worksheet.columns = ExportObject(exportFor, currentRole, t);
    if (jsonData) {
      worksheet.addRows(jsonData);
    }

    const updatedExcelBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([updatedExcelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName ?? currentRole?.title ?? exportFor}.xlsx`);
  };
  return { exportDataFunc };
};

export const getObjectKey = (jsonData: any, fieldToConvert?: string[]) => {
  const allStrings: string[] = [];
  const stringMap = new Map();

  // Function to collect all strings
  function collectStrings(obj: any, parentKey = '') {
    if (typeof obj === 'string') {
      if (
        (!fieldToConvert || fieldToConvert.includes(parentKey)) &&
        !stringMap.has(parentKey)
      ) {
        stringMap.set(parentKey, null);
        allStrings.push(parentKey);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => collectStrings(item, parentKey));
    } else if (obj !== null && typeof obj === 'object') {
      // collectStrings(value, key)
      Object.entries(obj).forEach(([key, value]) => {
        collectStrings(value, key);
      });
    }
  }
  collectStrings(jsonData);
  return allStrings;
};

export const updateQueryParameters = (
  queryParams: URLSearchParams,
  key: string,
  value: string[]
) => {
  if (!_.isEmpty(value)) {
    queryParams.set(key, String(value));
  } else {
    queryParams.delete(key);
  }
};

type FilterValue =
  | string
  | string[]
  | { [key: string]: any }
  | undefined
  | null
  | Date;

export interface GenericFilterObject {
  [key: string]: FilterValue;
}

export const hasValues = <T extends { [key: string]: any }>(obj: T): boolean => {
  return Object.values(obj).some((value) => {
    if (value === undefined || value === null) {
      return false;
    }
    if (typeof value === 'string' || value instanceof Date) {
      return value.toString().trim() !== '';
    }
    if (Array.isArray(value)) {
      return (
        value.length > 0 &&
        value.some((v) => {
          if (typeof v === 'string') {
            return v.trim() !== '';
          }
          if (typeof v === 'number') {
            return !isNaN(v);
          }
          return hasValues(v);
        })
      );
    }
    if (typeof value === 'object') {
      return hasValues(value);
    }
    return false;
  });
};

export const convertToItalianDecimalSystem = (number: number) => {
  if (isNaN(number)) {
    return null;
  }

  return number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrency = (
  amount: number,
  currency = 'EUR'
): string | number | undefined => {
  if (isNaN(amount)) {
    return undefined;
  }

  let formattedAmount: string;

  switch (currency) {
    case 'EUR':
      formattedAmount = amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      break;
    case 'CHF':
      formattedAmount = amount.toLocaleString('de-CH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      formattedAmount = formattedAmount
        .replace(/\./g, "'")
        .replace(/'(\d{2})$/, '.$1');
      break;
    default:
      return amount;
  }

  return formattedAmount;
};

export const getCurrencySymbol = (currencyCode = 'EUR') => {
  const currencySymbols: { [key: string]: string } = {
    EUR: '€',
    CHF: 'CHF',
  };

  return currencySymbols[currencyCode] || '';
};

export const dummyMailProviders = [
  'example.com',
  'testmail.com',
  'dummyemail.com',
  'fakemail.com',
  'mailinator.com',
  'tempmail.com',
  'temporaryemail.com',
  'maildrop.cc',
  'guerrillamail.com',
  '10minutemail.com',
  'discard.email',
  'throwawaymail.com',
  'fakeinbox.com',
  'getnada.com',
  'mailnesia.com',
  'mailcatch.com',
  'spambox.com',
  'spamex.com',
  'burnermail.io',
  'protonmail.com',
  'yopmail.com',
  'inboxbear.com',
  'mytemp.email',
  'temp-mail.org',
  'mail-temp.com',
  'mailinator.net',
  'tmpmail.net',
  'meltmail.com',
  'mailnesia.net',
  'trashmail.com',
  'simplemail.io',
  'mymail.com',
  'fake-mail.com',
  'moakt.com',
  'getairmail.com',
  'mailtothis.com',
  'temp-mail.io',
  'gmx.us',
  'tempmail.de',
];

export const isDummyEmail = (email: string) => {
  const domain = email.split('@')[1];
  return dummyMailProviders.includes(domain);
};
export const displayUsers = [
  {
    id: 2,
    label: 'Training specialist',
    value: 'TrainingSpecialist',
  },
  {
    id: 3,
    label: 'Trainer',
    value: 'Trainer',
  },
  {
    id: 6,
    label: 'Sales rep',
    value: 'SalesRep',
  },
  {
    id: 7,
    label: 'Accounting specialist',
    value: 'Accounting',
  },
];
