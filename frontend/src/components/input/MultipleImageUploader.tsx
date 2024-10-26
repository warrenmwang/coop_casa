import React, { useEffect, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MAX_IMAGE_FILE_SIZE, MAX_PROPERTY_IMGS_ALLOWED } from "@app/appConstants";
import { OrderedFile } from "@app/types/Types";
import {
  orderedFileArray2FileArray,
  fileArray2OrderedFileArray,
} from "@app/utils/utils";
import FormButton from "@app/components/buttons/FormButton";

/*

In hindsight, the creation of the "ordered file" is a stupid thing to do.
If you need any ordering of the files, it should just use the position in the array of File[].
Why are you adding an extra thing to complicate things. Stupid design.

I believe the only reason the idea of OrderedFile was created was because we assume that
whatever backend we use (even though I'm literally creating the supposed to simple backend myself)
does not guarantee the same order of files that we send them to be created in.
Although, that doesn't make any sense, it's like saying we send them a bytestream
and we don't expect it to give us the bytestream back in the same order when requested?
No, that doesn't make any sense, it's supposed to have the same order. 

Why did I make this stupid decision. God.
Do I keep this stupid design and work with it, or refactor everything that uses this stupid thing?

*/

type MultipleImageUploaderProps = {
  onImagesUploaded: (files: OrderedFile[]) => void;
  images: OrderedFile[];
  setIsChanged?: (value: React.SetStateAction<boolean>) => void;
};

// UI to let user either click to upload or drag and drop image files
// into the component to upload images. Also has an image preview box.
// Is interactive and lets the user remove any uploaded images.
// Uses a flexbox to have the drag and drop box be on the left hand sice
// while the image previews are on the right hand side. And if screen is small,
// then the right hand side preview box will be pushed to be below the upload box.
const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({
  onImagesUploaded,
  images,
  setIsChanged,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(
    images === undefined ? [] : orderedFileArray2FileArray(images),
  );

  useEffect(() => {
    if (images) {
      setUploadedFiles(orderedFileArray2FileArray(images));
    }
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...uploadedFiles, ...acceptedFiles];
      setUploadedFiles(newFiles);
      onImagesUploaded(fileArray2OrderedFileArray(newFiles));
      if (setIsChanged) {
        setIsChanged(true);
      }
    },
    [uploadedFiles, onImagesUploaded],
  );

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onImagesUploaded(fileArray2OrderedFileArray(newFiles));
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  const removeAllFiles = () => {
    setUploadedFiles([]);
    onImagesUploaded([]);
    if (setIsChanged) {
      setIsChanged(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: true,
    maxFiles: MAX_PROPERTY_IMGS_ALLOWED,
    minSize: 0,
    maxSize: MAX_IMAGE_FILE_SIZE,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 rounded-lg cursor-pointer ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-blue-500">Drop the files here ...</p>
        ) : (
          <p className="text-center text-gray-500">
            Drag and drop some files here, or click to select files
          </p>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${index}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <FormButton
              onClick={() => removeFile(index)}
              displayText="&times;"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 hover:bg-red-600"
            />
          </div>
        ))}
      </div>
      {uploadedFiles.length > 0 && (
        <FormButton
          onClick={removeAllFiles}
          displayText="Remove All"
          color="red"
        />
      )}
    </>
  );
};

export default MultipleImageUploader;
