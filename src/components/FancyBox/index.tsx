import { useEffect } from 'react';

import { Fancybox as NativeFancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const FancyBox = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    NativeFancybox.bind('[data-fancybox]', {
      Carousel: {
        infinite: false,
      },
    });

    return () => {
      NativeFancybox.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default FancyBox;
