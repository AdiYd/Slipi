import React from 'react';

const Logo: React.FC = () => {
  return (
      <div id="logo" className="mx-auto w-full self-center flex justify-center">
        <a 
            href="https://www.slipi.co.il/" 
            title="slipi"
            className="inline-block"
            rel="noopener noreferrer"
          >
            <img 
              src="https://d3m9l0v76dty0.cloudfront.net/system/logos/5217/original/2e1c7f809a210d2fbdf69a08b35c8f6e.png" 
              alt="slipi" 
              title="slipi"
              className="h-8 w-auto mb-2 object-contain"
              data-lazy="no-lazy"
            />
          </a>
      </div>
  );
};

export default Logo;
