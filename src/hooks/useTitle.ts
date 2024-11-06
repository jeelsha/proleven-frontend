import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTitle, setTitle } from 'redux-toolkit/slices/documentTitleSlice';

export const useTitle = () => {
  const title = useSelector(getTitle);
  const dispatch = useDispatch();
  useEffect(() => {
    document.title = title;
  }, [title]);

  const updateTitle = (newTitle: string) => {
    dispatch(setTitle({ title: newTitle }));
    return newTitle;
  };

  return updateTitle;
};
