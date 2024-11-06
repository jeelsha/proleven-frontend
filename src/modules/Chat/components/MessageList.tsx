import { REACT_APP_API_BASE_URL } from 'config';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// ** style **
import '../style/chat.css';

// ** constants **
import {
  IMAGE_SUPPORTED_FORMATS,
  VIDEO_SUPPORTED_FORMATS,
} from 'constants/filesupport.constant';

// ** utils **
import { getDateForChat, getFormattedDate } from 'utils/date';

// ** types **
import Image from 'components/Image';
import { ChatMessageType, MessageListPropsType, RenderImageType } from '../types';

// ** components **
import Button from 'components/Button/Button';
import FancyBox from 'components/FancyBox';
import { useEffect, useState } from 'react';

// ** Services
import { getPresignedImageUrl } from 'services/aws.service';

const MessageList = ({
  chatList,
  user,
  chatWithUser,
  imageLoader,
  baseImage,
}: MessageListPropsType) => {
  const { t } = useTranslation();

  const [tempImage, setTempImage] = useState<string>('');
  const [preloadedUrls, setPreloadedUrls] = useState<Record<string, string>>({});

  const mapChatList = (item: ChatMessageType, urls: Record<string, string>) =>
    item.messages.flatMap((message) =>
      message.multiImageData.map(async (media) => {
        if (media.media) {
          const url = await getPresignedImageUrl(
            media.media,
            undefined,
            undefined,
            true
          );
          urls[media.media] = url;
        }
      })
    );

  const preloadUrls = async () => {
    const urls: Record<string, string> = {};
    const promises = chatList.flatMap((item) => mapChatList(item, urls));
    await Promise.all(promises);
    setPreloadedUrls(urls);
  };

  useEffect(() => {
    if (Object.keys(baseImage).length > 0 && typeof baseImage === 'object') {
      setTempImage(URL.createObjectURL(new Blob(baseImage as Array<File>)));
    }
  }, [baseImage]);

  useEffect(() => {
    preloadUrls();
  }, [chatList]);

  const renderCount = ({
    index,
    limitedImages,
    imagesToRender,
  }: RenderImageType) => {
    return (
      limitedImages &&
      index === 3 &&
      imagesToRender !== 0 && (
        <div className="more-image-overlay">+{imagesToRender}</div>
      )
    );
  };

  const renderImages = ({
    index,
    limitedImages,
    imagesToRender,
    media,
    src,
  }: RenderImageType) => {
    return (
      <div
        className={`flex relative flex-col ${limitedImages && 'max-w-[374px]'}`}
        key={index}
      >
        <Link
          to={media ?? ''}
          className={`block rounded-md rounded-br-none relative ${
            index === 4 && 'hidden'
          } ${limitedImages ? 'h-32 ' : ' w-[374px] h-[167px]'}`}
          data-fancybox
        >
          <Image
            src={src}
            imgClassName="w-full h-full object-cover object-center rounded-md rounded-br-none"
            alt="chat"
            width={100}
            height={100}
            serverPath
          />
        </Link>
        {renderCount({ index, limitedImages, imagesToRender })}
      </div>
    );
  };

  const renderVideos = ({
    index,
    limitedImages,
    imagesToRender,
    media,
    src,
  }: RenderImageType) => {
    return (
      <div
        key={index}
        className={`flex relative flex-col ${
          limitedImages ? 'max-w-[374px]' : 'w-[374px]'
        }`}
      >
        <Link
          className={`relative  ${index === 4 && 'hidden'} ${
            limitedImages ? 'h-32 ' : 'h-[167px]'
          }`}
          to={media ?? ''}
          data-fancybox
        >
          {/* Eslint give error, include track inside video */}
          {/* eslint-disable jsx-a11y/media-has-caption */}
          <video
            className="w-full h-full object-cover rounded-md"
            autoPlay={false}
            controls={false}
            width="100%"
            height="150%"
          >
            <track kind="captions" />
            <source src={`${REACT_APP_API_BASE_URL}/${src}`} />
          </video>

          <div className="video-icon-container">
            <Button className="video-icon">
              <Image iconName="playIcon" iconClassName="w-full h-full" />
            </Button>
          </div>
        </Link>

        {limitedImages && index === 3 && imagesToRender !== 0 && (
          <div className="more-image-overlay">+{imagesToRender}</div>
        )}
      </div>
    );
  };

  const renderMedia = (item: ChatMessageType['messages'][number]) => {
    const limitedImages = item.multiImageData.length > 3;
    const imagesToRender = item.multiImageData.length - 4;

    return (
      <FancyBox>
        <div
          className={
            limitedImages
              ? 'grid grid-cols-2 w-[280px] gap-2 bg-dark/10 p-2 rounded-lg rounded-br-none'
              : 'flex flex-col gap-y-4'
          }
        >
          {item.media &&
            item?.multiImageData?.map((images, index) => {
              const isImage = IMAGE_SUPPORTED_FORMATS.includes(images?.media_type);
              const isVideo = VIDEO_SUPPORTED_FORMATS.includes(images?.media_type);
              const imgUrl = preloadedUrls[images.media] || '';

              if (isImage) {
                return renderImages({
                  index,
                  limitedImages,
                  imagesToRender,
                  media: imgUrl ?? images?.media,
                  src: images?.media,
                });
              }
              if (isVideo) {
                return renderVideos({
                  index,
                  limitedImages,
                  imagesToRender,
                  media: imgUrl ?? images?.media,
                  src: images?.media,
                });
              }

              return (
                <Link
                  key={images?.id}
                  to={imgUrl ?? ''}
                  target="_blank"
                  className=" w-[200px] min-h-[100px] px-4 py-2 pt-5 rounded-lg bg-primary text-white flex flex-col gap-4 justify-center items-center"
                >
                  <span className="inline-block w-7 h-7 mx-auto">
                    <Image
                      iconName="downloadFile"
                      iconClassName="text-current w-full h-full"
                    />
                  </span>
                  <p
                    className="truncate text-sm font-medium w-full block "
                    title={
                      item?.media?.includes('/')
                        ? item?.media?.split('/').pop()
                        : item?.media?.split('\\').pop()
                    }
                  >
                    {item?.media?.includes('/')
                      ? item?.media?.split('/').pop()
                      : item?.media?.split('\\').pop()}
                  </p>
                </Link>
              );
            })}
        </div>
      </FancyBox>
    );
  };

  const isLink = (msg: string) => {
    const regex = /(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})[/\w .-]*/;
    const isMsgLink = regex.test(msg);

    if (isMsgLink) {
      if (msg.startsWith('http://') || msg.startsWith('https://')) {
        return (
          <Link target="_blank" to={msg}>
            {msg}
          </Link>
        );
      }

      return (
        <Link target="_blank" to={`http://${msg}`}>
          {msg}
        </Link>
      );
    }
    return msg;
  };

  return (
    <div className="flex flex-col-reverse">
      {chatList?.map((item, index) => (
        <div key={`chatMsg_${index + 1}`}>
          <div className="display-date-line">
            <span className="bg-white inline-block px-3 relative text-sm font-medium text-grayText">
              {getDateForChat(item?.date, true, t)}
            </span>
          </div>

          {item?.messages
            ?.slice()
            .sort(
              (
                first: ChatMessageType['messages'][number],
                second: ChatMessageType['messages'][number]
              ) => first.id - second.id
            )
            ?.map((msg, index) => (
              <div
                key={`msg_${index + 1}`}
                className="msg-item flex gap-x-4 mb-4 last:mb-0"
              >
                <div
                  className={`flex items-start w-full max-w-[75%] ${
                    msg?.sender_id === user?.id &&
                    'ms-auto justify-start flex-row-reverse'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full relative">
                    <Image
                      src={
                        msg?.sender?.profile_image ?? '/images/default-avatar.jpg'
                      }
                      imgClassName="w-full h-full object-cover rounded-full"
                      width={50}
                      height={50}
                      alt="placeholderProfile"
                      serverPath
                    />

                    {chatWithUser?.creatorUser?.chat_user_status !== 'offline' &&
                      msg?.sender_id !== user?.id && (
                        <span className="active-user" />
                      )}
                  </span>
                  <div
                    className={`max-w-[calc(100%_-_32px)] w-fit flex flex-col ${
                      msg?.sender_id === user?.id ? 'pe-3' : 'ps-3'
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-y-1.5 w-fit ${
                        msg?.sender_id === user?.id && 'items-end ms-auto'
                      }`}
                    >
                      {msg?.text && (
                        <span
                          className={`${
                            msg?.sender_id === user?.id ? 'bg-primary' : 'bg-black'
                          } px-4 py-1.5 rounded-md text-white text-base leading-5 w-fit min-w-[100px] break-all inline-flex`}
                        >
                          {isLink(msg?.text)}
                        </span>
                      )}
                      {!_.isEmpty(msg?.multiImageData) && renderMedia(msg)}
                    </div>
                    <span
                      className={` ${
                        msg?.sender_id === user?.id ? 'ms-auto' : 'me-auto'
                      } timeStamp text-xs text-grayText leading-4 block mt-1 w-fit`}
                    >
                      {getFormattedDate(msg?.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          {imageLoader?.loader &&
            imageLoader?.imageRoomId !== 0 &&
            imageLoader?.imageRoomId === chatWithUser?.room_id && (
              <div className="flex items-end w-full">
                <div className="flex lazy me-3 flex-col gap-y-1.5 w-full items-end ms-auto relative  max-w-[374px]">
                  <Image
                    src={tempImage}
                    imgClassName="w-full h-full object-cover object-center rounded-md rounded-br-none"
                    width={50}
                    height={50}
                    alt="placeholderProfile"
                    serverPath
                  />
                </div>

                {chatWithUser?.creatorUser?.chat_user_status !== 'offline' && (
                  <span className="active-user" />
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
