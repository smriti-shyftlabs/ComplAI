import { useState, useEffect, useCallback } from 'react';
import * as productService from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData) => {
    try {
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, data) => {
    try {
      const updated = await productService.updateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const publishProduct = useCallback(async (id) => {
    try {
      const published = await productService.publishProduct(id);
      setProducts(prev => prev.map(p => p.id === id ? published : p));
      return published;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getProductById = useCallback(async (id) => {
    try {
      return await productService.getProductById(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    publishProduct,
    getProductById
  };
};
