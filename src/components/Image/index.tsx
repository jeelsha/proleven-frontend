import { useEffect, useState } from 'react';

// ** Components **

// ** type **
import NameBadge from 'components/Badge/NameBadge';
import Icon from 'components/Icon';
import Loaders from 'components/Loaders';
import { getPresignedImageUrl } from 'services/aws.service';
import { IImageProps } from './interface';

const Image = (props: IImageProps) => {
  const {
    src = '',
    alt,
    imgClassName = '',
    NameBadgeParentClass,
    serverPath = false,
    firstName,
    lastName,
    disableLoader = false,
    iconClassName,
    iconName = 'noImgStrokeSD',
    loaderType = '',
    height,
    width,
    loaderClassName,
    showImageLoader = false,
  } = props;
  // ** States **
  const [fetchError, setFetchError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [imageURL, setImageURL] = useState<string | File>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (
      src &&
      typeof src === 'string' &&
      serverPath &&
      iconName === 'noImgStrokeSD'
    ) {
      loadServerImage(src);
    } else {
      setImageURL(src || '');
    }
  }, [src, height, width, serverPath]);

  const loadServerImage = async (path: string) => {
    setIsLoading(true);
    const result = await getPresignedImageUrl(path, height, width, true);
    setIsLoading(false);
    setImageURL(result || '');
  };

  const imgComponent = () => {
    if (imageURL) {
      if (fetchError) {
        return (
          <img
            className={`block ${imgClassName}`}
            src="/images/no-image.png"
            alt={`${alt ?? src}`}
          />
        );
      }

      return (
        <img
          className={`${!isImageLoaded ? 'hidden' : 'block'} ${imgClassName}`}
          src={`${imageURL}`}
          alt={`${alt || src}`}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setFetchError(true);
            setIsImageLoaded(true);
          }}
          height={height}
          width={width}
        />
      );
    }
    // if (!loaderType && iconName === 'noImgStrokeSD' && !firstName && !lastName) {
    //   return (
    //     <img
    //       className={`block ${imgClassName}`}
    //       src="/images/no-image.png"
    //       alt={`${alt ?? 'No Image'}`}
    //     />
    //   );
    // }
    return <Icon className={iconClassName} name={iconName} />;
  };

  return (
    <>
      {!disableLoader && loaderType && (
        <Loaders className={loaderClassName} type={loaderType || 'Spin'} />
      )}
      {(firstName || lastName) && (
        <NameBadge
          parentClass={NameBadgeParentClass}
          FirstName={firstName ?? ''}
          LastName={lastName ?? ''}
        />
      )}
      {isLoading ||
        (!disableLoader && !isImageLoaded && imageURL && showImageLoader && (
          <Loaders className={loaderClassName} type={loaderType || 'Spin'} />
        ))}
      {imgComponent()}
    </>
  );
};

export default Image;
