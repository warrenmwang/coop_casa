import React, { useState } from "react";
import { useGetProperties } from "@app/hooks/properties";
import { Property } from "@app/types/Types";
import PropertyCard from "@app/components/properties/PropertyCard";
import Modal from "@app/components/Modal";

import { LIKED_ENTITIES_DISPLAY_NUM_PREVIEW } from "@app/appConstants";

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
        <button className="text-9xl" onClick={() => setIsModalOpen(true)}>
          ...
        </button>
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
