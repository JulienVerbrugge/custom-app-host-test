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
          uuid: uuid,
        };
        setProductData(productInfo);
        setOrderData([]);
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

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <SectionTitle>
          <SectionTitle.Title style={{ color: "#58316f" }}>Product Information</SectionTitle.Title>
        </SectionTitle>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>UUID</Table.Cell>
              <Table.Cell style={{ color: "#58316f" }}>{productData.uuid}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default IframeExtension;