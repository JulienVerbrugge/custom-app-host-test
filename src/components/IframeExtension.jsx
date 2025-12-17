import React, { useState, useEffect } from 'react';
import {
  SectionTitle,
  Table,
  Button,
} from 'akeneo-design-system';

const IframeExtension = () => {
  const [productData, setProductData] = useState({});
  const [orderData, setOrderData] = useState([]);
  const [contextData, setContextData] = useState(null);
  const [userData, setUserData] = useState(null);

  const parseQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('product[uuid]') || null;
  };

  const fetchProductData = (uuid) => {
    fetch(`/api/get-product-order-status/${uuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const productInfo = {
          sku: data.values?.sku?.[0]?.data || 'N/A',
          name: data.values?.name?.[0]?.data || 'N/A',
          family: data.family || 'N/A',
        };
        setProductData(productInfo);
        setOrderData(data.order || []);
      })
      .catch((error) => {
        console.error('Error fetching product data:', error);
      });
  };

  const requestContext = () => {
    console.log('Requesting context from parent window...');
    window.parent.postMessage(
      {
        type: 'request_context'
      },
      "*"
    );
    console.log('PostMessage sent to parent');
  };

  const reloadParent = () => {
    console.log('Requesting parent window reload...');
    window.parent.postMessage(
      {
        type: 'reload_parent'
      },
      "*"
    );
    console.log('Reload PostMessage sent to parent');
  };

  const requestJwt = () => {
    console.log('Requesting JWT from parent window...');
    window.parent.postMessage(
      {
        type: 'request_jwt'
      },
      "*"
    );
    console.log('JWT request PostMessage sent to parent');
  };

  useEffect(() => {
    const uuid = parseQueryParams();
    if (uuid) {
      fetchProductData(uuid);
    }

    // Counter to track if event listener is working
    let messageCount = 0;

    const handleMessage = (event) => {
      messageCount++;
      console.log(`🔔 MESSAGE #${messageCount} RECEIVED!`);
      console.log('📦 Full event:', event);
      console.log('📋 Message data:', event.data);
      console.log('🌐 Message origin:', event.origin);
      console.log('📍 Message source:', event.source);
      console.log('---');

      if (event.data && typeof event.data === 'object') {
        if (event.data.context && event.data.user) {
          console.log('✅ Valid Akeneo context received!');
          console.log('Context:', event.data.context);
          console.log('User:', event.data.user);
          setContextData(event.data.context);
          setUserData(event.data.user);
        } else {
          console.log('⚠️ Message structure:', Object.keys(event.data));
        }
      } else {
        console.log('⚠️ Message is not an object:', typeof event.data);
      }
    };

    console.log('✅ Message event listener attached!');
    window.addEventListener('message', handleMessage);

    // Test the listener by sending a message to ourselves
    console.log('🧪 Testing message listener with self-message...');
    setTimeout(() => {
      window.postMessage({ test: 'self-message', timestamp: Date.now() }, '*');
    }, 500);

    return () => {
      console.log('❌ Message event listener removed');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return '#528f5c';
      case 'pending':
        return '#c79032';
      case 'cancelled':
        return '#a94c3f';
      default:
        return 'black';
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <SectionTitle>
          <SectionTitle.Title style={{ color: "#58316f" }}>Product Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>SKU</Table.Cell>
              <Table.Cell style={{ color: "#58316f" }}>{productData.sku}</Table.Cell>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell style={{ color: "#58316f" }}>{productData.name}</Table.Cell>
              <Table.Cell>Family</Table.Cell>
              <Table.Cell style={{ color: "#58316f" }}>{productData.family}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>

      <div>
        <SectionTitle>
          <SectionTitle.Title style={{ color: "#764194" }}>Order Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Header>
            <Table.HeaderCell>Order Number</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Header>
          <Table.Body>
            {orderData.length > 0 ? (
              orderData.map((order, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{order.number}</Table.Cell>
                  <Table.Cell>{order.quantity}</Table.Cell>
                  <Table.Cell style={{ color: getStatusColor(order.status) }}>
                    {order.status}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={3} style={{ textAlign: 'center' }}>
                  No orders available
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      <div>
        <SectionTitle>
          <SectionTitle.Title style={{ color: "#8b4c9e" }}>Akeneo Context & Actions</SectionTitle.Title>
        </SectionTitle>
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
          <Button onClick={requestContext}>
            Request Context via PostMessage
          </Button>
          <Button onClick={reloadParent} level="secondary">
            Reload Parent Window
          </Button>
          <Button onClick={requestJwt} level="tertiary">
            Request JWT
          </Button>
        </div>
        {contextData && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <strong>Context Information:</strong>
              <Table>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Locale</Table.Cell>
                    <Table.Cell style={{ color: "#8b4c9e" }}>{contextData.locale || 'N/A'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Channel</Table.Cell>
                    <Table.Cell style={{ color: "#8b4c9e" }}>{contextData.channel || 'N/A'}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </div>
            {userData && (
              <div>
                <strong>User Information:</strong>
                <Table>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>UUID</Table.Cell>
                      <Table.Cell style={{ color: "#8b4c9e" }}>{userData.uuid || 'N/A'}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Username</Table.Cell>
                      <Table.Cell style={{ color: "#8b4c9e" }}>{userData.username || 'N/A'}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell>Groups</Table.Cell>
                      <Table.Cell style={{ color: "#8b4c9e" }}>
                        {userData.groups ? userData.groups.join(', ') : 'N/A'}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </div>
            )}
          </>
        )}
        {!contextData && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Click the button above to request context from Akeneo PIM
          </p>
        )}
      </div>
    </div>
  );
};

export default IframeExtension;