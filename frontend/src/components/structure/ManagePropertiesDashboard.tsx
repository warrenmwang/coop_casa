import React from "react";

/*
-- name: CreateProperty :exec
WITH new_property AS (
    INSERT INTO properties 
    (
    property_id, lister_user_id, "name", "description", 
    address_1, address_2, city, "state", zipcode, country, num_bedrooms, 
    num_toilets, num_showers_baths, cost_dollars, cost_cents, misc_note
    )
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING property_id
)
INSERT INTO properties_images (property_id, images)
SELECT property_id, $17
FROM new_property;

*/
type Property = {
  property_id: string;
  lister_user_id: string;
  name: string;
  description: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  num_bedrooms: number;
  num_toilets: number;
  num_showers_baths: number;
  cost_dollars: number;
  cost_cents: number;
  misc_note: string;
  images: string;
};

const ManagePropertiesDashboard: React.FC = () => {
  return(
    <>
      <div className="flex flex-col items-center">
        <p>Manage Properties component.</p>
        {/* TODO: create a new property */}
        {/* TODO: show existing properties that current user has */}
      </div>
    </>
  );
};

export default ManagePropertiesDashboard;