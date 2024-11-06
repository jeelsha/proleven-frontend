// ** Components **
import { GoogleMap, Libraries, Marker } from '@react-google-maps/api';
import InputField from 'components/FormElement/InputField';

// ** Hooks **
import { useEffect, useState } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

// ** Helper Functions **
import _ from 'lodash';
import { fromAddress, fromLatLng, setKey } from 'react-geocode';
import { useDebounce } from 'utils';

// ** Types **
import { SetFieldValue } from 'types/common';

// ** Slice

const containerStyle = {
  width: '100%',
  height: '300px',
};

type LatLngType = {
  lat: number;
  lng: number;
};
type IProp = {
  center: LatLngType;
  name: string;
  mapZoom?: number;
  setFieldValue?: SetFieldValue;
  setLatLng?: React.Dispatch<React.SetStateAction<LatLngType>>;
  locationLabel?: string;
  locationValue?: string;
  isDisabled?: boolean;
  isCompulsory?: boolean;
  isLoading?: boolean;
  className?: string;
};

const clientKey = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '';
const IS_MAP_ENABLED = process.env.REACT_APP_GOOGLE_MAP_ENABLED
  ? JSON.parse(process.env.REACT_APP_GOOGLE_MAP_ENABLED)
  : false;
if (IS_MAP_ENABLED) setKey(clientKey);

const libraries: Libraries = ['places'];

const Map = (props: IProp) => {
  const {
    center,
    name,
    mapZoom = 5,
    setFieldValue,
    setLatLng,
    locationLabel,
    locationValue,
    isDisabled,
    className,
    isCompulsory = false,
    isLoading = false,
  } = props;

  // ** CONSTs
  const ITALY_LATITUDE = 41.87194;
  const ITALY_LONGITUDE = 12.56738;
  const initialMapPosition = {
    lat: _.isEmpty(center.lat) ? ITALY_LATITUDE : center.lat,
    lng: _.isEmpty(center.lng) ? ITALY_LONGITUDE : center.lng,
  };

  // ** States
  const [address, setAddress] = useState(locationValue ?? '');
  const [mapPosition, setMapPosition] = useState(initialMapPosition);
  const [markerPosition, setMarkerPosition] = useState(initialMapPosition);

  const debounceAddress = useDebounce(address, 1500);
  const handleSelectedPlace = (selectedPlaces: google.maps.places.PlaceResult) => {
    const { geometry } = selectedPlaces;
    const lat = geometry?.location?.lat();
    const lng = geometry?.location?.lng();
    if (lat && lng) {
      setMapPosition({
        lat,
        lng,
      });
      setMarkerPosition({
        lat,
        lng,
      });
      setAddress(
        selectedPlaces?.formatted_address ? selectedPlaces.formatted_address : ''
      );
      setFieldValue?.(name, selectedPlaces.formatted_address);
      setLatLng?.({
        lat,
        lng,
      });
    }
  };

  const { ref } = usePlacesWidget({
    libraries,
    ...(IS_MAP_ENABLED
      ? { onPlaceSelected: handleSelectedPlace, apiKey: clientKey }
      : {}),
  });

  // ** useEffects
  useEffect(() => {
    if (debounceAddress && IS_MAP_ENABLED) {
      addressToCoordinate();
    }
  }, [debounceAddress]);

  useEffect(() => {
    if (locationValue) {
      setAddress(locationValue);
    }
  }, [locationValue]);

  const addressToCoordinate = async () => {
    try {
      const response = await fromAddress(debounceAddress);
      if (response?.results) {
        const fromAddressToCoordinate = response?.results[0]?.geometry?.location;
        if (fromAddressToCoordinate) {
          setAddress(response.results?.[0]?.formatted_address);
          setMarkerPosition(fromAddressToCoordinate);
          setMapPosition(fromAddressToCoordinate);
          setLatLng?.(fromAddressToCoordinate);
          setFieldValue?.(name, response.results?.[0]?.formatted_address);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    try {
      if (event.latLng) {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        let addressTemp;
        setMapPosition({ lat: newLat, lng: newLng });
        setMarkerPosition({ lat: newLat, lng: newLng });
        fromLatLng(newLat, newLng).then(
          (response) => {
            addressTemp =
              response?.results?.[1]?.formatted_address ??
              response?.results?.[0]?.formatted_address;
            if (addressTemp) {
              setAddress(addressTemp);
              setFieldValue?.(name, addressTemp);
            } else {
              setFieldValue?.(name, '');
              setAddress('');
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="lazy h-12" />
      ) : (
        <div className={`${className} 'w-full' `}>
          <InputField
            label={locationLabel}
            name={name}
            placeholder="Enter Location"
            value={address}
            type="text"
            ref={
              IS_MAP_ENABLED
                ? (ref as unknown as React.Ref<HTMLInputElement>)
                : undefined
            }
            onChange={(e) => {
              setAddress((e.target as HTMLInputElement).value);
              setFieldValue?.(name, (e.target as HTMLInputElement).value);
            }}
            isDisabled={isDisabled}
            isCompulsory={isCompulsory}
          />

          {IS_MAP_ENABLED ? (
            <div className="rounded-lg overflow-hidden mt-3">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={{
                  lat: mapPosition.lat ?? 41.8719,
                  lng: mapPosition.lng ?? 12.5674,
                }}
                zoom={mapZoom}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  draggable: !isDisabled,
                }}
              >
                <Marker
                  draggable={!isDisabled}
                  onDragEnd={(e) => onMarkerDragEnd(e)}
                  position={{
                    lat: markerPosition.lat ?? 41.8719,
                    lng: markerPosition.lng ?? 12.5674,
                  }}
                />
              </GoogleMap>
            </div>
          ) : (
            ''
          )}
        </div>
      )}
    </>
  );
};

export default Map;
