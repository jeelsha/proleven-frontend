import _ from 'lodash'
import { convertIMG } from '../utils'
import { Cards } from '../types'
import { useTranslation } from 'react-i18next'
import Image from 'components/Image'

export const CardModalProjectNotes = (props: {
    projectDetail: Cards['project']
}) => {
    const { t } = useTranslation();
    const { projectDetail } = props;
    return (
        // <CustomCard cardClass='my-2.5' minimal title={t('ProjectManagementDetailPage.cardNotes')}>
        <div className='my-2.5'>
            {/* text={t('ProjectManagementDetailPage.cardNotes')} */}
            {projectDetail?.project_notes &&
                !_.isEmpty(projectDetail.project_notes) ? (
                <div className="bg-gray-100 rounded-md border border-solid border-gray-200 p-4">
                    <p className='text-lg font-semibold text-dark pb-2 flex items-center'><Image iconName='fileIcon' iconClassName='w-5 h-5 mr-2' /> {t('ProjectManagementDetailPage.cardNotes')}</p>
                    {projectDetail.project_notes.map((item, index) => (
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <p
                            className="text-base font-normal text-dark/60"
                            onClick={(e) => e.preventDefault()}
                            key={`project_${index + 1}`}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: convertIMG(item.content) }}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-100 rounded-md border border-solid border-gray-200 p-4 flex items-center flex-col justify-center">
                    {/* <p className='text-lg font-semibold text-dark pb-2 flex items-center'><Image iconName='fileIcon' iconClassName='w-5 h-5 mr-2' /> {t('ProjectManagementDetailPage.cardNotes')}</p> */}
                    <Image iconName='fileIcon' iconClassName='w-8 h-8 mb-2 text-dark/60' />
                    <p className='text-base font-normal text-dark'>{t('ProjectManagementDetailPage.cardNotesNotFound')}</p>
                </div>
            )}
        </div>
        // </CustomCard>
    )
}
