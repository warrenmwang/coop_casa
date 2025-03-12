import React, { useState } from "react";

import { LIKED_ENTITIES_DISPLAY_NUM_PREVIEW } from "@app/appConstants";
import Modal from "@app/components/Modal";
import ShowMoreButton from "@app/components/buttons/ShowMoreButton";
import PropertyCard from "@app/components/properties/PropertyCard";
import { useGetProperties } from "@app/hooks/properties";
import { Property } from "@app/types/Types";

type LayoutSectionPropertiesWithModalProps = {
  propertyIDs: string[];
  modalTitle: string;
};

const LayoutSectionPropertiesWithModal: React.FC<
  LayoutSectionPropertiesWithModalProps
> = ({ propertyIDs, modalTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const propertyQueries = useGetProperties(propertyIDs);

  const properties: Property[] = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    }) as Property[];

  return (
    <>
      <div className="container__horizontal_card_layout">
        {properties
          .slice(0, LIKED_ENTITIES_DISPLAY_NUM_PREVIEW)
          .map((value) => {
            return (
              <PropertyCard key={value.details.propertyId} property={value} />
            );
          })}
        <ShowMoreButton onClick={() => setIsModalOpen(true)} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="container__horizontal_card_layout">
          {properties.map((value) => {
            return (
              <PropertyCard key={value.details.propertyId} property={value} />
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default LayoutSectionPropertiesWithModal;
