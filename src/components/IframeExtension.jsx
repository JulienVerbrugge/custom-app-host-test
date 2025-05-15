import React, { useState, useEffect } from 'react';
import {
  SectionTitle,
  Table,
} from 'akeneo-design-system';

const IframeExtension = () => {
  const [productData, setProductData] = useState({});
  const [orderData, setOrderData] = useState([]);

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
    if (uuid) {
      fetchProductData(uuid);
    }
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
    </div>
  );
};

export default IframeExtension;