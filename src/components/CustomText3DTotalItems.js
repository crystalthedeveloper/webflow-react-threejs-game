// path: src/components/CustomText3DTotalItems.js
import React, { useEffect } from 'react';
import fetchWebflowData from '../utils/fetchWebflowData';

const CustomText3DTotalItems = ({ onItemsLoaded }) => {
  useEffect(() => {
    const getData = async () => {
      const data = await fetchWebflowData();
      if (onItemsLoaded) {
        onItemsLoaded(data.length); // Notify the parent about the number of items
      }
    };

    getData();
  }, [onItemsLoaded]);

  return null;
};

export default CustomText3DTotalItems;