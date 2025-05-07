import React, { useState, useEffect } from 'react';
import {
  SectionTitle,
  Helper,
  Table,
} from 'akeneo-design-system';

const IframeExtension = () => {
  const [jwt, setJwt] = useState('');
  const [userData, setUserData] = useState({});
  const [validationSteps, setValidationSteps] = useState({
    tokenRetrieved: false,
    tokenVerified: false,
    userValidated: false,
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Parse query parameters from the URL
  const parseQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const user = {
      id: params.get('user[id]'),
      username: params.get('user[username]'),
      email: params.get('user[email]'),
      catalogLocale: params.get('user[catalog_locale]'),
      catalogScope: params.get('user[catalog_scope]'),
      uiLocale: params.get('user[ui_locale]'),
    };
    setUserData(user);
  };

  const requestJwt = () => {
    window.parent.postMessage({ type: 'request_jwt' }, '*');
  };

  const handleMessage = (event) => {
    if (event.data.type === 'JWT_TOKEN') {
      const token = event.data.token;
      setJwt(token);
      setValidationSteps((prev) => ({ ...prev, tokenRetrieved: true }));
    }
  };

  const verifyToken = () => {
    fetch('/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({token: jwt}),
    })
      .then((response) =>  response.json())
      .then((data) => {
        setValidationSteps((prev) => ({...prev, tokenVerified: data.valid}));
        setValidationSteps((prev) => ({...prev, userValidated: data.valid && data.decoded.userId === userData.id}));

        if (!data.valid || data.decoded.userId !== userData.id) {
          setErrorMessage('Token validation failed. User ID does not match or token is invalid.');
        }
      })
      .catch((error) => {
        console.error('Error verifying token:', error);
        setErrorMessage('An error occurred while verifying the token.');
      });
  };

  useEffect(() => {
    parseQueryParams();
    window.addEventListener('message', handleMessage);

    // Automatically request the JWT token when the component mounts
    requestJwt();

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {

    if (jwt && userData) {
      verifyToken();
    }

  }, [userData, jwt]);

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* User Data Section */}
      <div style={{ flex: 1 }}>
        <SectionTitle>
          <SectionTitle.Title>User Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Body>
            {Object.entries(userData).map(([key, value]) => (
              <Table.Row key={key}>
                <Table.Cell>{key}</Table.Cell>
                <Table.Cell>{value}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Validation Steps Section */}
      <div style={{ flex: 1 }}>
        <SectionTitle>
          <SectionTitle.Title>Validation Steps</SectionTitle.Title>
        </SectionTitle>
        <div style={{ marginTop: '20px' }}>
          <Helper level={validationSteps.tokenRetrieved ? 'success' : 'error'}>
            {validationSteps.tokenRetrieved
              ? 'Token has been retrieved.'
              : 'Failed to retrieve token.'}
          </Helper>
          <Helper level={validationSteps.tokenVerified ? 'success' : 'error'}>
            {validationSteps.tokenVerified
              ? 'Token has been verified.'
              : 'Token verification failed.'}
          </Helper>
          <Helper level={validationSteps.userValidated ? 'success' : 'error'}>
            {validationSteps.userValidated
              ? 'User is validated.'
              : 'User validation failed.'}
          </Helper>
          {errorMessage && (
            <Helper level="error" style={{ marginTop: '10px' }}>
              {errorMessage}
            </Helper>
          )}
      </div>
      </div>
    </div>
  );
};

export default IframeExtension;