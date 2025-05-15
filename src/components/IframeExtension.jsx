import React, { useState, useEffect } from 'react';
import {
  SectionTitle,
  Table,
} from 'akeneo-design-system';

const IframeExtension = () => {
  const [productData, setProductData] = useState({});
  const [orderData, setOrderData] = useState([]);

  // Parse query parameters from the URL
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

  useEffect(() => {
    const uuid = parseQueryParams();
    console.log('UUID from URL:', uuid);
    if (uuid) {
      fetchProductData(uuid);
    }
  }, []);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Product Information Section */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Product Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>SKU</Table.Cell>
              <Table.Cell>{productData.sku}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>{productData.name}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Family</Table.Cell>
              <Table.Cell>{productData.family}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>

      {/* Order Information Section */}
      <div>
        <SectionTitle>
          <SectionTitle.Title>Order Information</SectionTitle.Title>
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
                  <Table.Cell>{order.status}</Table.Cell>
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
    </div>
  );
};

export default IframeExtension;