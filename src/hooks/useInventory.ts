import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Product, Supplier, Sale, StockAlert, Profile } from '../types';

export const useInventory = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      loadData();
    }
  }, [user, profile]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        loadSuppliers(),
        loadProducts(),
        loadSales(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading suppliers:', error);
      return;
    }

    const mappedSuppliers: Supplier[] = data.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone || undefined,
      email: supplier.email || undefined,
      address: supplier.address || undefined,
      createdAt: new Date(supplier.created_at),
      profileId: supplier.profile_id,
    }));

    setSuppliers(mappedSuppliers);
  };

  const loadProducts = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        suppliers (
          id,
          name,
          contact,
          phone,
          email,
          address,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    const mappedProducts: Product[] = data.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      currentStock: product.current_stock,
      minStock: product.min_stock,
      maxStock: product.max_stock,
      unitPrice: product.unit_price,
      supplierId: product.supplier_id || '',
      supplier: product.suppliers ? {
        id: product.suppliers.id,
        name: product.suppliers.name,
        contact: product.suppliers.contact,
        phone: product.suppliers.phone || undefined,
        email: product.suppliers.email || undefined,
        address: product.suppliers.address || undefined,
        createdAt: new Date(product.suppliers.created_at),
      } : undefined,
      description: product.description || undefined,
      sku: product.sku || undefined,
      unit: product.unit,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      profileId: product.profile_id,
    }));

    setProducts(mappedProducts);
    generateStockAlerts(mappedProducts);
  };

  const loadSales = async () => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        products (
          id,
          name,
          unit
        )
      `)
      .eq('user_id', user.id)
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sales:', error);
      return;
    }

    const mappedSales: Sale[] = data.map(sale => ({
      id: sale.id,
      productId: sale.product_id,
      quantity: sale.quantity,
      date: new Date(sale.sale_date),
      totalValue: sale.total_value,
      profileId: sale.profile_id,
    }));

    setSales(mappedSales);
  };

  const generateStockAlerts = (productList: Product[]) => {
    const newAlerts: StockAlert[] = [];
    
    productList.forEach(product => {
      if (product.currentStock <= 0) {
        newAlerts.push({
          id: `alert-${product.id}`,
          productId: product.id,
          product,
          alertType: 'out_of_stock',
          isActive: true,
          createdAt: new Date(),
        });
      } else if (product.currentStock <= product.minStock) {
        newAlerts.push({
          id: `alert-${product.id}`,
          productId: product.id,
          product,
          alertType: 'low_stock',
          isActive: true,
          createdAt: new Date(),
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !profile) return;

    const {  error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        category: product.category,
        current_stock: product.currentStock,
        min_stock: product.minStock,
        max_stock: product.maxStock,
        unit_price: product.unitPrice,
        supplier_id: product.supplierId || null,
        description: product.description || null,
        sku: product.sku || null,
        unit: product.unit,
        user_id: user.id,
        profile_id: profile.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }

    await loadProducts();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.currentStock !== undefined) updateData.current_stock = updates.currentStock;
    if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
    if (updates.maxStock !== undefined) updateData.max_stock = updates.maxStock;
    if (updates.unitPrice !== undefined) updateData.unit_price = updates.unitPrice;
    if (updates.supplierId !== undefined) updateData.supplier_id = updates.supplierId || null;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.sku !== undefined) updateData.sku = updates.sku || null;
    if (updates.unit !== undefined) updateData.unit = updates.unit;

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    await loadProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    await loadProducts();
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('suppliers')
      .insert({
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone || null,
        email: supplier.email || null,
        address: supplier.address || null,
        user_id: user.id,
        profile_id: profile.id,
      });

    if (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }

    await loadSuppliers();
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.contact !== undefined) updateData.contact = updates.contact;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.address !== undefined) updateData.address = updates.address || null;

    const { error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    await loadSuppliers();
  };

  const deleteSupplier = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }

    await loadSuppliers();
  };

  const recordSale = async (sale: Omit<Sale, 'id'>) => {
    if (!user || !profile) return;

    const { error: saleError } = await supabase
      .from('sales')
      .insert({
        product_id: sale.productId,
        quantity: sale.quantity,
        total_value: sale.totalValue,
        sale_date: sale.date.toISOString(),
        user_id: user.id,
        profile_id: profile.id,
      });

    if (saleError) {
      console.error('Error recording sale:', saleError);
      throw saleError;
    }

    // Update product stock
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const newStock = Math.max(0, product.currentStock - sale.quantity);
      await updateProduct(sale.productId, { currentStock: newStock });
    }

    await loadSales();
  };

  const recordSales = async (sales: Omit<Sale, 'id'>[]) => {
    if (!user || !profile) return;
    // Inserta todas las ventas
    const salesToInsert = sales.map(sale => ({
      product_id: sale.productId,
      quantity: sale.quantity,
      total_value: sale.totalValue,
      sale_date: sale.date.toISOString(),
      user_id: user.id,
      profile_id: profile.id,
    }));
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesToInsert);
    if (salesError) {
      console.error('Error recording sales:', salesError);
      throw salesError;
    }
    // Actualiza el stock de cada producto
    for (const sale of sales) {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        const newStock = Math.max(0, product.currentStock - sale.quantity);
        await updateProduct(sale.productId, { currentStock: newStock });
      }
    }
    await loadSales();
  };

  // CRUD de perfiles/locales
  const getProfiles = async (): Promise<Profile[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
    return data || [];
  };

  const createProfile = async (profile: Omit<Profile, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .insert({
        name: profile.name,
        address: profile.address || null,
        user_id: user.id,
      });
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  return {
    products,
    suppliers,
    sales,
    alerts,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    recordSale,
    recordSales,
    loadData,
    getProfiles,
    createProfile,
    deleteProfile,
  };
};