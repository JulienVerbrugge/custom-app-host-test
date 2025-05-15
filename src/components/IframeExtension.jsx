import React, { useState, useEffect } from 'react';
import {
  SectionTitle,
  Table,
} from 'akeneo-design-system';

const IframeExtension = () => {
  const [productData, setProductData] = useState({});

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
          name: data.values?.name?.[0]?.data || 'N/A',
          sku: data.values?.sku?.[0]?.data || 'N/A',
          category: data.categories?.[0] || 'N/A',
          family: data.family || 'N/A',
          order: data.order,
        };
        setProductData(productInfo);      
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
    <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
      {/* Product Data Section */}
      <div style={{ flex: 1 }}>
        <SectionTitle>
          <SectionTitle.Title>Product Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Body>
            {Object.entries(productData).map(([key, value]) => (
              <Table.Row key={key}>
                <Table.Cell>{key}</Table.Cell>
                <Table.Cell>{value}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default IframeExtension;