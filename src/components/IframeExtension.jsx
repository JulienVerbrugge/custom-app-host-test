import React, { useState } from 'react';

const IframeExtension = () => {
  const [jwt, setJwt] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [secret, setSecret] = useState('');

  const requestJwt = () => {
    window.parent.postMessage({ type: 'request_jwt' }, '*');
  };

  const handleMessage = (event) => {
    if (event.data.type === 'JWT_TOKEN') {
      const token = event.data.token;
      setJwt(token);

      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      setDecodedToken(decodedPayload);
    }
  };

  const verifyToken = () => {
    fetch('/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: jwt, secret }),
    })
      .then((response) => response.json())
      .then((data) => setVerificationResult(data))
      .catch((error) => console.error('Error verifying token:', error));
  };

  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div>
      <h1>Akeneo Iframe Extension</h1>
      <button onClick={requestJwt}>Request JWT</button>
      {jwt && (
        <>
          <pre>{jwt}</pre>
          <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
          <div>
            <label htmlFor="secretInput">Enter Secret:</label>
            <input
              type="text"
              id="secretInput"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret here"
            />
            <button onClick={verifyToken}>Submit Secret</button>
          </div>
          {verificationResult && (
            <pre>{JSON.stringify(verificationResult, null, 2)}</pre>
          )}
        </>
      )}
    </div>
  );
};

export default IframeExtension;