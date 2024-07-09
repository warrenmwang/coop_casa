import React, { useEffect, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_PROPERTY_IMGS_ALLOWED,
} from "../../constants";
import { OrderedFile } from "../../types/Types";

const orderedFileArray2FileArray = (arr: OrderedFile[]): File[] => {
  const newArr: File[] = Array(arr.length);
  let file: OrderedFile;
  for (let i = 0; i < arr.length; i++) {
    file = arr[i];
    newArr[file.orderNum] = file.file;
  }
  return newArr;
};

const fileArray2OrderedFileArray = (arr: File[]): OrderedFile[] => {
  const newArr: OrderedFile[] = Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    newArr[i] = {
      orderNum: i,
      file: arr[i],
    } as OrderedFile;
  }
  return newArr;
};

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
            Drag 'n' drop some files here, or click to select files
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
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      {uploadedFiles.length > 0 && (
        <button
          type="button"
          onClick={removeAllFiles}
          className="mt-4 bg-red-500 text-white p-2 rounded-lg w-3/5"
        >
          Remove All
        </button>
      )}
    </>
  );
};

export default MultipleImageUploader;
