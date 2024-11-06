import { useEffect, useRef, useState } from 'react';
// **libraries**
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Form, Formik, FormikValues } from 'formik';
import _ from 'lodash';

// **hooks**
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// ** component **
import Button from 'components/Button/Button';
import InputFileField from 'components/FormElement/InputFileField';
import TextArea from 'components/FormElement/TextArea';
import EmojiHappy from 'components/Icon/assets/EmojiHappy';
import SendIcon from 'components/Icon/assets/SendIcon';
import Image from 'components/Image';

// ** redux **
import { socketSelector } from 'redux-toolkit/slices/socketSlice';

// ** style **
import '../style/chat.css';

// ** constants **
import { socketName } from 'constants/common.constant';
import { fileAcceptType } from '../constants';

// ** type **
import { useAxiosPost } from 'hooks/useAxios';
import { setToast } from 'redux-toolkit/slices/toastSlice';
import { customRandomNumberGenerator } from 'utils';
import { ChatRoomPropType, InitialValueType, SendMessageType } from '../types';

interface Emoji {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

const SendMessage = ({
  setAttachFile,
  attachFile,
  user,
  roomId,
  chatWithUser,
  setImageLoader,
  setBaseImage,
}: ChatRoomPropType) => {
  const { t } = useTranslation();

  const socket = useSelector(socketSelector);

  const emojiRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<{
    values: InitialValueType;
    submit?: () => Promise<void>;
  }>({
    submit: undefined,
    values: {
      chat_message_image: [],
      text: '',
    },
  });

  const [uploadMedia, { isLoading }] = useAxiosPost();

  let messageData: SendMessageType;

  const [initialValue, setInitialValue] = useState<InitialValueType>({
    chat_message_image: [],
    text: '',
  });
  const [formKey, setFormKey] = useState(0);
  const [emojiFire, setEmojiFire] = useState(false);
  const [acceptFile, setAcceptFile] = useState<keyof typeof fileAcceptType>();
  const dispatch = useDispatch();

  useEffect(() => {
    setImageLoader?.({ loader: isLoading, imageRoomId: roomId });
  }, [isLoading]);

  useEffect(() => {
    setInitialValue({ chat_message_image: [], text: '' });
    setFormKey((prevKey) => prevKey + 1);
  }, [roomId]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) =>
      handleKeyDown(e, submitRef.current.values, submitRef.current.submit);

    window.addEventListener('keydown', keyListener);

    return () => window.removeEventListener('keydown', keyListener);
  }, [submitRef.current]);

  const handleClickOutside = (event: MouseEvent) => {
    if (emojiRef.current && !emojiRef.current.contains(event?.target as Node)) {
      setEmojiFire(false);
    }
  };

  const uploadChatMedia = async (files: Array<File>) => {
    const formData = new FormData();

    if (roomId !== -1) {
      formData.append('room_id', String(roomId));
    }
    formData.append('sender_id', String(user?.id));
    formData.append('receiver_id', String(chatWithUser?.creatorUser?.id));
    files.forEach((item) => {
      formData.append('chat_message_image', item);
    });
    await uploadMedia('/chat/upload', formData);
  };

  const OnSend = async (data: FormikValues) => {
    if (data.text && data.text?.length < 1000) {
      messageData = {
        text: data.text,
        sender_id: user?.id,
        receiver_id: chatWithUser?.creatorUser?.id,
      };

      if (roomId !== -1) {
        messageData.room_id = roomId;
      }

      socket?.emit(socketName.SEND_MESSAGE, messageData);
    } else if (data.text && data.text?.length > 1000) {
      dispatch(
        setToast({
          variant: 'Error',
          message: t('Chat.textTooLong'),
          type: 'error',
          id: customRandomNumberGenerator(),
        })
      );
    }
    if (data.chat_message_image.length > 0) {
      await uploadChatMedia(data.chat_message_image);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent,
    value: InitialValueType,
    submitForm?: () => Promise<void>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (
        (value.text && !_.isEmpty(value.text.trim())) ||
        (value.chat_message_image && !_.isEmpty(value.chat_message_image))
      ) {
        submitForm?.();
      }
    }
  };

  const getFileType = () => {
    return Object.keys(fileAcceptType)
      .filter((key) => key === acceptFile)
      .toString();
  };

  return (
    <div className="userChatInput mt-auto relative">
      <Formik
        key={formKey}
        enableReinitialize
        initialValues={initialValue}
        onSubmit={(values, { resetForm }) => {
          OnSend(values);
          resetForm();
        }}
      >
        {({ values, setFieldValue, submitForm }) => {
          submitRef.current.values = values;
          if (values.chat_message_image.length > 0)
            setBaseImage?.(values.chat_message_image);
          submitRef.current.submit = submitForm;
          return (
            <Form>
              <InputFileField
                id="chatUpload"
                fileType={getFileType()}
                isMulti
                setValue={setFieldValue}
                acceptTypes={
                  acceptFile ? fileAcceptType[acceptFile].toString() : '*/*'
                }
                name="chat_message_image"
                value={values.chat_message_image}
                isControls={false}
              />
              <div className="border-t border-solid border-gray-300 py-2.5 px-5 select-none flex items-center gap-x-3">
                <div className="w-7 h-7 relative z-3">
                  <div
                    className={`absolute bottom-full !left-1/2 !-translate-x-1/2 transition-all duration-500 ease-in-out ${
                      attachFile
                        ? ' h-[150px] scale-100 origin-bottom opacity-100'
                        : ' h-0 scale-0 opacity-0'
                    }`}
                  >
                    <div className="flex flex-col gap-y-2 pb-3">
                      <Button
                        tooltipPosition="top"
                        tooltipText={t('Tooltip.Image')}
                        type="button"
                        onClickHandler={() => {
                          setAcceptFile('image');
                          setAttachFile?.(false);
                        }}
                      >
                        <label htmlFor="chatUpload" className="chat_file_label">
                          <Image
                            iconName="imageIcon2"
                            iconClassName="w-full h-full"
                          />
                        </label>
                      </Button>
                      <Button
                        tooltipPosition="top"
                        tooltipText={t('Tooltip.Video')}
                        type="button"
                        onClickHandler={() => {
                          setAcceptFile('video');
                          setAttachFile?.(false);
                        }}
                      >
                        <label htmlFor="chatUpload" className="chat_file_label">
                          <Image
                            iconName="videoIcon"
                            iconClassName="w-full h-full"
                          />
                        </label>
                      </Button>
                      <Button
                        tooltipPosition="top"
                        tooltipText={t('Tooltip.Document')}
                        type="button"
                        onClickHandler={() => {
                          setAcceptFile('document');
                          setAttachFile?.(false);
                        }}
                      >
                        <label htmlFor="chatUpload" className="chat_file_label">
                          <Image
                            iconName="fileBlankIcon"
                            iconClassName="w-full h-full"
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClickHandler={() => setAttachFile?.(!attachFile)}
                    className={`chat-file-open ${
                      attachFile ? ' bg-white' : ' bg-transparent'
                    }`}
                  >
                    <Image
                      iconName="plusIcon"
                      iconClassName={`w-full h-full transition-all duration-300 ${
                        attachFile ? 'rotate-45' : ''
                      }`}
                    />
                  </Button>
                </div>

                <TextArea
                  resizeDisable
                  value={values.text}
                  name="text"
                  parentClass="flex-[1_0_0%]"
                  className="w-full"
                  rows={1}
                  placeholder={t('Chat.sendMessagePlaceholder')}
                />
                <div className="w-7 h-7 relative group" ref={emojiRef}>
                  {emojiFire && (
                    <div className="absolute bottom-full right-0  origin-bottom-right">
                      <Picker
                        data={data}
                        onEmojiSelect={(emojiObject: Emoji) => {
                          return setFieldValue(
                            'text',
                            values.text + emojiObject.native
                          );
                        }}
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    onClickHandler={() => setEmojiFire(!emojiFire)}
                    className="chat-emoji-button"
                  >
                    <EmojiHappy className="w-full h-full" />
                  </Button>
                </div>

                <Button
                  disabled={
                    _.isEmpty(values.chat_message_image) &&
                    _.isEmpty(values.text.trim())
                  }
                  variants="primary"
                  className="chat-submit-button"
                  type="submit"
                >
                  <span>
                    <SendIcon className="w-full h-full" />
                  </span>
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default SendMessage;
