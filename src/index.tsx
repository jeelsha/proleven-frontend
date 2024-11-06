import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from 'redux-toolkit/store';
import './ instrument';
// ** css **
import './index.css';
import './localization';

// ** Custom Components **

import { Libraries, LoadScript } from '@react-google-maps/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from 'App';
import { setupAxios } from 'base-axios';
import Loaders from 'components/Loaders';
import SocketComponent from 'components/Socket/SocketComponent';
import Toast from 'components/Toast';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const libraries: Libraries = ['places'];

setupAxios(store);
const clientKey =
  process.env.REACT_APP_GOOGLE_CLIENT_ID !== undefined
    ? process.env.REACT_APP_GOOGLE_CLIENT_ID
    : '';

const handleMapLoad = () => {
  console.log('map loaded');
};

root.render(
  // REMINDER: Need to remove Sentry after 15 days
  <Sentry.ErrorBoundary
    fallback={<h1>Something went wrong.</h1>}
    showDialog
    onError={(error, errorInfo) => {
      console.warn('Caught error', error, errorInfo);
    }}
  >
    <GoogleOAuthProvider
      onScriptLoadError={() => console.log('Error')}
      clientId={clientKey}
    >
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}
        libraries={libraries}
        onLoad={handleMapLoad}
        onError={(error) => console.error(error)}
        loadingElement={<Loaders type="SiteLoader" />}
      />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PersistGate loading={null} persistor={persistor}>
            <Toast />
            <SocketComponent />
            <App />
          </PersistGate>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  </Sentry.ErrorBoundary>
);
