import React, { useState } from 'react';
import {
    SectionTitle,
  } from 'akeneo-design-system';

const IframeExtension = () => {
  const [jwt, setJwt] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [secret, setSecret] = useState('');


  const handleMessage = (event) => {
    if (event.data.type === 'JWT_TOKEN') {
      const token = event.data.token;
      setJwt(token);

      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      setDecodedToken(decodedPayload);
    }
  };

  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <SectionTitle>
        <SectionTitle.Title>Akeneo Iframe Extension</SectionTitle.Title>
      </SectionTitle>
  </div>
  );
};

export default IframeExtension;