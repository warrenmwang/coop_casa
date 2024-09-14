import * as React from "react";
import { useGetProperties } from "../hooks/properties";
import { Property } from "../types/Types";
import PropertyCard from "./properties/PropertyCard";
import Modal from "./Modal";

type LayoutSectionPropertiesWithModalProps = {
  propertyIDs: string[];
};

const LayoutSectionPropertiesWithModal: React.FC<
  LayoutSectionPropertiesWithModalProps
> = ({ propertyIDs }) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const propertyQueries = useGetProperties(propertyIDs);

  const properties: Property[] = propertyQueries
    .map((value) => value.data)
    .filter((value) => {
      return value !== undefined;
    }) as Property[];

  return (
    <>
      <div className="flex items-center gap-2">
        {properties.slice(0, 3).map((value) => {
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
        title="Browse More Properties"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {properties.slice(0, 3).map((value) => {
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
