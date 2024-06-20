import React, { useState, useEffect } from "react";
import {v4 as uuidv4} from 'uuid';
import { fileToBase64 } from "../../utils/utils";
import { apiCreateNewProperty } from "../../api/api";
import { validateNumber } from "../../utils/inputValidation";

import { AuthData } from "../../auth/AuthWrapper";
import TextInput from "./TextInput";
import SubmitButton from "./SubmitButton";
import MultipleImageUploader from "./MultipleImageUploader";
import { MAX_PROPERTY_IMGS_ALLOWED } from "../../constants";

import "../../styles/font.css"

export type Property = {
  propertyId: string;
  listerUserId: string;
  name: string;
  description: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  squareFeet: number;
  numBedrooms: number;
  numToilets: number;
  numShowersBaths: number;
  costDollars: number;
  costCents: number;
  miscNote: string;
  images: string;
};

type TextFieldsConstruct = {
  id: string;
  label: string;
  placeholder: string;
  value: string | number;
  required : boolean;
  type: string;
  min?: string;
  max?: string;
}

export const EmptyProperty : Property = {
  propertyId : "",
  listerUserId: "",
  name: "",
  description: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  squareFeet: -1,
  numBedrooms: -1,
  numToilets: -1,
  numShowersBaths: -1,
  costDollars: -1,
  costCents: -1,
  miscNote: "",
  images: "",
}

// This component lets the user create a property,
// and be able to view and modify their created properties.
// (for authorized users: admin or lister roles)
const CreatePropertyForm: React.FC = () => {
  const auth = AuthData();
  const { user } = auth; 

  const [ newProperty, setNewProperty ] = useState<Property>(EmptyProperty);
  const [ isSubmitting, setIsSubmitting ] = useState<boolean>(false);
  const [ errors, setMyMap ] = useState<Map<string, boolean>>(new Map<string, boolean>()); // if any key value in errors is true, then there is a problem.
  const [images, setImages] = useState<File[]>([]);

  // for user inputs
  const propertyRequiredFields: string[] = [
    "name", "address1", "city", "state", "zipcode", "country",
    "squareFeet", "numBedrooms", "numToilets", "numShowersBaths",
    "costDollars", "costCents", "images"
  ];

  // FIXME: city state should probably be like user acc setup, where we use the autocomplete menu.
  
  const setErrors = (key: string, value: boolean) => {
    setMyMap(prevMap => {
      const newMap = new Map(prevMap)
      newMap.set(key, value)
      return newMap
    });
  }

  // Initialize with errots for all required fields, thus needing to make sure that 
  // the required fields are entered.
  useEffect(() => {
    // Set Errors for required fields that the user needs to fill in
    propertyRequiredFields.map(field => {
      setErrors(field, true);
    });
    // Set values that we don't want the user to fill in themselves.
    setNewProperty((prevState: any) => ({
      ...prevState,
      "propertyId": uuidv4(),
      "listerUserId": user.userId
    }));
  }, []);

  // for constructing the textinputs
  const propertyTextFieldsConstructs: TextFieldsConstruct[] = [
    {
      id: "name",
      label: "Property Name",
      placeholder: "",
      value: newProperty.name,
      required: true, type: "text"
    },
    {
      id: "description",
      label: "Description",
      placeholder: "",
      value: newProperty.description,
      required: false, type: "text"
    },
    {
      id: "address1",
      label: "Address 1",
      placeholder: "",
      value: newProperty.address1,
      required: true, type: "text"
    },
    {
      id: "address2",
      label: "Address 2",
      placeholder: "",
      value: newProperty.address2,
      required: false, type: "text"
    },
    {
      id: "city",
      label: "City",
      placeholder: "",
      value: newProperty.city,
      required: true, type: "text"
    },
    {
      id: "state",
      label: "State",
      placeholder: "",
      value: newProperty.state,
      required: true, type: "text"
    },
    {
      id: "zipcode",
      label: "Zipcode",
      placeholder: "",
      value: newProperty.zipcode,
      required: true, type: "text"
    },
    {
      id: "country",
      label: "country",
      placeholder: "",
      value: newProperty.country,
      required: true, type: "text"
    },
    {
      id: "squareFeet",
      label: "Square Feet",
      placeholder: "",
      value: newProperty.squareFeet,
      required: true, type: "number", min: "0", max: "999999999"
    },
    {
      id: "numBedrooms",
      label: "Number of Bedrooms",
      placeholder: "",
      value: newProperty.numBedrooms,
      required: true, type: "number", min: "0", max: "999999999999"
    },
    {
      id: "numToilets",
      label: "Number of Toilets",
      placeholder: "",
      value: newProperty.numToilets,
      required: true, type: "number", min: "0", max: "999999999999"
    },
    {
      id: "numShowersBaths",
      label: "Number of Showers and/or Baths",
      placeholder: "",
      value: newProperty.numShowersBaths,
      required: true, type: "number", min: "0", max: "999999999999"
    },
    {
      id: "costDollars",
      label: "Cost, Dollar Amount with no comma or dollar sign (e.g. 150000)",
      placeholder: "",
      value: newProperty.costDollars,
      required: true, type: "number", min: "0", max: "999999999999"
    },
    {
      id: "costCents",
      label: "Cost, cents portion, between 00 - 99",
      placeholder: "",
      value: newProperty.costCents,
      required: true, type: "number", min: "0", max: "99"
    },
    {
      id: "miscNote",
      label: "Misc. Notes (any comment that may not have been appropriate to put in the property description that the lister feels the buyer should know about should go here)",
      placeholder: "",
      value: newProperty.miscNote,
      required: false, type: "string"
    },
  ]

  const textInputHandleChange = (id: string, value: string) => {
    // need to convert the text input type=number values 
    // from variable type string into number
    var numberValue : number
    if (id === "squareFeet" || id === "numBedrooms" || id === "numToilets" || id === "numShowersBaths" || id === "costDollars" || id === "costCents") {
      // Validate string is a number
      if (!validateNumber(value)) {
        alert(`Value in field ${id} is not a number.`)
        return
      }
      // convert to number
      numberValue = Number(value)
      // save value for this field
      setNewProperty((prevState: any) => ({
        ...prevState,
        [id]: numberValue
      }));
      // set error to false for this field 
      setErrors(id, false);
      return;
    }

    // o.w. set value
    setNewProperty((prevState: any) => ({
      ...prevState,
      [id]: value
    }));

    // If required field is empty, then set error to true and quit
    if (propertyRequiredFields.includes(id) && value === "") {
      setErrors(id, true);
      return;
    }

    // valid save -- update error to false
    setErrors(id, false);
  }

  const handleImagesUploaded = (files: File[]) => {
    // update errors
    if (files.length > MAX_PROPERTY_IMGS_ALLOWED) {
      setErrors("images", true);
      setImages([]);
      alert(`Uploaded more than the maximum allowable images (${MAX_PROPERTY_IMGS_ALLOWED}).`);
      return;
    } else if (files.length === 0) {
      setErrors("images", true);
    } else {
      setErrors("images", false);
    }

    // save images state
    setImages(files);
  };

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault()

    // (oh no - "base64 that shit 🤡")
    // Convert each image into base64, join them together with comma delimiters
    // for sending to backend. Save into newproperty state.
    var propertyImagesStr : string = ""
    const delimiter : string = "#"
    for (const image of images) {
      const imageStr = await fileToBase64(image)
      if (propertyImagesStr.length === 0) {
        propertyImagesStr = imageStr;
      } else {
        propertyImagesStr += `${delimiter}${imageStr}`
      }
    }
    setNewProperty((prevState: any) => ({
      ...prevState,
      "images": propertyImagesStr
    }));

    // Only progress if no errors
    for(let [k,v] of errors){
      if(v) {
        setIsSubmitting(false);
        alert(`Please ensure field ${k} is set correctly and then try submitting again.`);
        return;
      }
    }

    // Set is submitting true, prevent spamming submit and start submission process.
    setIsSubmitting(true);
  }

  // Submit data if can submit
  useEffect(() => {
    const foo = async () => {
      if (isSubmitting) {
        // Send data to backend
        const response = await apiCreateNewProperty(newProperty);
        if (response) {
          if (response.ok) {
            // Clear the data
            setNewProperty(EmptyProperty);
            // Tell user submission was good
            alert("Property Created.")
          } else {
            // response was not ok
            alert("Got not ok response: " + response.statusText)
          }
        } else {
          alert("Try submitting again.")
        }

        // set is submitting to false
        setIsSubmitting(false);
      }
    };
    foo()
  }, [isSubmitting, newProperty]);

  return(
    <>
      <div className="flex justify-center items-center space-x-4 mt-4">
        <h1 className="h1_custom">Add Property Listing</h1>
      </div>
      <div className="flex justify-center items-center space-x-4 mt-4">
        <h4 className="h4_custom">This form allows you to upload a new property listing to the platform.</h4>
      </div>
      {/* create a new property */}
      <form className="default-form-1" onSubmit={handleSubmit}>
        {propertyTextFieldsConstructs.map((value, index) => (
          <TextInput
            key={index}
            setFormData={textInputHandleChange}
            setError={setErrors}
            type={value.type}
            id={value.id}
            label={value.label}
            placeholder={value.placeholder}
            value={`${value.value}`}
            required={value.required}
            min={value.min}
            max={value.max}
          />
        ))}

        {/* Images */}
        <label className="text_input_field_label_gray">
          Upload some images of the property. At least 1 image is required.
          <span className="text-red-500">*</span>
        </label>
        <MultipleImageUploader
          onImagesUploaded={handleImagesUploaded}
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </>
  );
};

export default CreatePropertyForm;