import React, { useState } from 'react';
import {
    Button,
    SectionTitle,
    TextInput,
    Helper,
    Table
  } from 'akeneo-design-system';

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
    <div style={{ padding: '20px' }}>
      <SectionTitle>
        <SectionTitle.Title>Akeneo Iframe Extension</SectionTitle.Title>
      </SectionTitle>

      <div style={{ marginTop: '20px' }}>        
        <Button onClick={requestJwt} level="primary">
          Request JWT
        </Button>
      </div>

      {jwt && (
        <>
          <Helper level="info">JWT Token:</Helper>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {jwt}
          </pre>

          <Helper level="info">Decoded Token:</Helper>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {JSON.stringify(decodedToken, null, 2)}
          </pre>

          <TextInput
            id="secretInput"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your secret here"
            label="Secret"
            required
            readOnly={false}
          />
          <Button onClick={verifyToken} level="secondary" style={{ marginTop: '10px' }}>
            Submit Secret
          </Button>

          {verificationResult && (
            <>
              <Helper level={verificationResult.valid ? 'success' : 'error'}>
                {verificationResult.valid ? 'Token is valid!' : 'Token is invalid!'}
              </Helper>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Cell>Key</Table.Cell>
                    <Table.Cell>Value</Table.Cell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.entries(verificationResult.decoded || {}).map(([key, value]) => (
                    <Table.Row key={key}>
                      <Table.Cell>{key}</Table.Cell>
                      <Table.Cell style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {value.toString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </>
          )}
        </>
      )}
  </div>
  );
};

export default IframeExtension;