import * as React from "react";

type MemoizedImageElementProps = {
  image: File;
  className?: string;
};

const MemoizedImageElement: React.FC<MemoizedImageElementProps> = ({
  image,
  className = "",
}) => {
  const [imageURL, setImageURL] = React.useState<string>("");

  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageURL(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  return <img src={imageURL} className={className} />;
};

export default React.memo(MemoizedImageElement);