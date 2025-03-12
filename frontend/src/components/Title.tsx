import React from "react";

interface TitleProps {
  title: string;
  description?: string;
  className?: string;
}

const Title: React.FC<TitleProps> = ({
  title,
  description,
  className = "",
}) => {
  return (
    <div className={`row ${className}`}>
      <div className="col-lg-6 mx-auto">
        <div className="title-area text-center">
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Title;
