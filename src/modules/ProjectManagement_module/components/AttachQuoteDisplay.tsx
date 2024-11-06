import Button from "components/Button/Button";
import Image from "components/Image";
import { PRIVATE_NAVIGATION } from "constants/navigation.constant";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AttachQuoteDisplayProp } from "../types";

export const AttachQuoteDisplay = ({ isViewable, projectQuote, attachQuoteModal }: AttachQuoteDisplayProp) => {
    const { t } = useTranslation();
    return (
        <>
            {!_.isEmpty(projectQuote) && (
                <div className="w-full">
                    <span className="block w-full text-sm leading-4 text-grayText mb-2.5">
                        {t('ProjectManagement.CustomCardModal.Button.attachQuote')}
                    </span>
                    <div className="flex items-center flex-wrap gap-2">
                        {projectQuote?.map(
                            (quoteData, index) => {
                                return (
                                    <Button
                                        className="h-10"
                                        key={`quote_index_${index + 1}`}
                                        variants="primary"
                                    >
                                        <Link
                                            to={`${PRIVATE_NAVIGATION.quotes.list.path}/view/${quoteData?.quote?.slug}`}
                                            target="_blank"
                                        >
                                            {quoteData?.quote?.quote_number}
                                        </Link>
                                    </Button>
                                );
                            }
                        )}
                        {!isViewable && (
                            <Button
                                className="w-9 h-9 !p-2 "
                                variants="whiteBordered"
                                onClickHandler={() => {
                                    attachQuoteModal.toggleDropdown();
                                }}
                            >
                                <Image iconName="plusIcon" iconClassName="w-full h-full" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
