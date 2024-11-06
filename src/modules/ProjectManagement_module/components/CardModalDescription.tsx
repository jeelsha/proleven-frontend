import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

// ** component **

// ** hooks **
import ReactEditor from 'components/ReactQuillEditor/ReactQuillEditor';
import { useAxiosPatch } from 'hooks/useAxios';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'utils';

const CardModalDescription = (props: {
  desc: string;
  card_id: number;
  isViewable?: boolean;
}) => {
  const { desc, card_id, isViewable = false } = props;
  const { t } = useTranslation();

  const firstRender = useRef(true);

  const [updateCardPatch, { isLoading }] = useAxiosPatch();
  const [description, setDescription] = useState<string>(desc ?? '');
  const debounceDescription = useDebounce(description, 1000);
  const initialDesc = {
    description: desc ?? '',
  };

  const saveDescriptionOnChange = async () => {
    // if (debounceDescription) {
    await updateCardPatch(`/cards/${card_id}`, {
      description: !_.isEmpty(debounceDescription) ? debounceDescription : null,
    });
    // }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    saveDescriptionOnChange();
  }, [debounceDescription]);

  return (
    <Formik
      initialValues={initialDesc}
      onSubmit={() => {
        // handle submit
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <div className="mt-7 flex flex-col gap-3">
            <ReactEditor
              value={values.description}
              onChange={(newContent: string) => {
                setDescription(newContent);
                setFieldValue('description', newContent);
              }}
              disabled={isViewable}
              name="description"
              placeholder={t('ProjectManagement.CustomCardModal.description')}
              label={t('ProjectManagement.CustomCardModal.descriptionLabel')}
              labelClass="text-sm leading-4 text-grayText mb-2.5"
              isLoading={isLoading}
              // id="card_editor"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CardModalDescription;
