import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'components/Image';

interface InfiniteScrollProps {
  className?: string;
  callBack: () => Promise<void>;
  children: React.ReactNode;
  hasMoreData: boolean;
  showLoading?: boolean;
}

const InfiniteScroll = ({
  children,
  className,
  callBack,
  hasMoreData,
  showLoading,
}: InfiniteScrollProps) => {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollPosition = useRef(0);

  const onScroll = useCallback(() => {
    if (loading || !hasMoreData) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    scrollPosition.current = scrollTop; // Save scroll position
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setLoading(true);
    }
  }, [loading, hasMoreData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', onScroll);
    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loading) return;

    callBack().finally(() => {
      setLoading(false);
      container.scrollTop = scrollPosition.current; // Restore scroll position
    });
  }, [loading, callBack]);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'auto' }}>
      {children}
      {loading || (showLoading && hasMoreData) ? (
        <div className="flex justify-center items-center">
          <Image loaderType="Spin" />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default InfiniteScroll;
