// ** Packages **
import { isEmpty } from 'lodash';
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// ** Components **
import Layout from 'components/Layout';
import Loaders from 'components/Loaders';
import { PRIVATE_NAVIGATION } from 'constants/navigation.constant';

// ** constants **
import { ROLES } from 'constants/roleAndPermission.constant';

// ** redux **
import { getCurrentUser } from 'redux-toolkit/slices/authSlice';

import ErrorBoundary from 'modules/Auth/pages/ErrorBoundary';
import { ErrorBoundary as ErrorBoundaryDependency } from 'react-error-boundary';
import { setDefaultTitle } from 'redux-toolkit/slices/documentTitleSlice';

// ** lazy **
const Toast = React.lazy(() => import('components/Toast'));
const SocketComponent = React.lazy(
  () => import('components/Socket/SocketComponent')
);

type Props = {
  children: JSX.Element;
};

const RequiresAuth = (props: Props) => {
  const { children } = props;
  const user = useSelector(getCurrentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    if (user && user?.role_name === ROLES.Trainer && checkProfileSetup()) {
      navigate(PRIVATE_NAVIGATION.trainerRegister.view.path);
    }
  }, [user]);

  const checkProfileSetup = () => {
    return isEmpty(user?.trainer?.location);
  };
  useEffect(() => {
    document.title = 'Proleven Whiz'
    dispatch(setDefaultTitle());
  }, [window.location.href]);

  return (
    <ErrorBoundaryDependency FallbackComponent={ErrorBoundary}>
      <Layout>
        <Suspense fallback={<Loaders type="SiteLoader" />}>
          <Toast />
          <SocketComponent />
          {children}
        </Suspense>
      </Layout>
    </ErrorBoundaryDependency>
  );
};

export default RequiresAuth;
