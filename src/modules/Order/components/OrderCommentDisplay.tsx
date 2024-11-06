import Button from 'components/Button/Button';
import Image from 'components/Image';
import { FormatDateFromNow } from 'constants/common.constant';
import { useEffect, useRef, useState } from 'react';
import { OrderCommentDisplayProps } from '../types';

const OrderCommentDisplay = ({
  orderCommentList,
  CurrentUser,
  storeLang,
  t,
}: OrderCommentDisplayProps) => {
  const scrollDivRef = useRef<HTMLDivElement>(null);

  const [sliceBy, setSliceBy] = useState({
    activitySlice: 5,
  });

  useEffect(() => {
    if (sliceBy.activitySlice !== 3 && orderCommentList) {
      scrollToTop();
    }
  }, [orderCommentList]);

  const scrollToTop = () => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  return (
    <div
      ref={scrollDivRef}
      className="overflow-auto max-h-[330px] p-2  comment-list flex flex-col gap-y-5"
    >
      {orderCommentList
        ?.slice(0, sliceBy.activitySlice)
        ?.map((data, index: number) => {
          return (
            <div key={`order_comment_${index + 1}`}>
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7">
                  <Image
                    width={32}
                    height={32}
                    alt={t('ProjectManagement.CustomCardModal.attachmentAltText')}
                    src={CurrentUser?.profile_image ?? '/images/default-avatar.jpg'}
                    imgClassName="w-full h-full object-cover rounded-full"
                    serverPath
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-primary text-sm font-semibold">
                    {data?.orderUser?.full_name}
                  </p>
                  <span className="block text-grayText text-xs leading-4">
                    {data?.created_at &&
                      FormatDateFromNow(data?.created_at, true, storeLang.language)}
                  </span>
                </div>
              </div>
              <div className="border border-solid border-borderColor rounded-lg p-4 mt-2.5 text-sm text-dark">
                {data.comment}
              </div>
            </div>
          );
        })}
      {orderCommentList && orderCommentList?.length > 5 && (
        <Button
          onClickHandler={() => {
            setSliceBy({
              activitySlice:
                sliceBy.activitySlice !== orderCommentList?.length &&
                orderCommentList
                  ? orderCommentList.length
                  : 5,
            });
          }}
          className="w-fit text-sm text-primary underline underline-offset-4 font-medium hover:opacity-70"
        >
          {sliceBy.activitySlice === orderCommentList?.length
            ? t('ProjectManagement.CustomCardModal.showLess')
            : t('ProjectManagement.CustomCardModal.showMore')}
        </Button>
      )}
    </div>
  );
};
export default OrderCommentDisplay;
