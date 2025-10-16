import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ReplenishmentRequest } from '@/types';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const useReplenishment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfile();
  const {  } = useAuth();

  // Función para obtener el teléfono del admin (proveedor default)
  const getAdminPhone = async (): Promise<string> => {
    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (!supaUser || !profile) return '';

      const { data: defaultSupplier } = await supabase
        .from('suppliers')
        .select('phone')
        .eq('name', 'default')
        .eq('user_id', supaUser.id)
        .eq('profile_id', profile.id)
        .single();

      return defaultSupplier?.phone || '';
    } catch (err) {
      console.error('Error obteniendo teléfono del admin:', err);
      return '';
    }
  };

  const createReplenishmentRequest = async (
    productId: string,
    quantity: number,
    supplierId: string
  ): Promise<ReplenishmentRequest | null> => {
    setLoading(true);
    setError(null);

    try {
      // Obtener el usuario actual
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (!supaUser || !profile) {
        throw new Error('Usuario o perfil no autenticado');
      }

      // Crear la solicitud de reabastecimiento
      const { data, error: insertError } = await supabase
        .from('replenishment_requests')
        .insert({
          product_id: productId,
          supplier_id: supplierId,
          quantity,
          status: 'pending',
          requested_by: supaUser.id,
          requested_at: new Date().toISOString(),
          profile_id: profile.id,
        })
        .select(`
          *,
          product:products(*),
          supplier:suppliers(*)
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      // Obtener el teléfono del admin
      const adminPhone = await getAdminPhone();

      // Notificar a n8n si está configurado
      if (N8N_WEBHOOK_URL) {
        try {
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'single',
              request: data,
              profile,
              adminPhone,
              productName: data.product?.name || '',
              supplierPhone: data.supplier?.phone || '',
            }),
          });
        } catch (err) {
          console.error('Error notificando a n8n:', err);
        }
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al crear solicitud de reabastecimiento:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getReplenishmentRequests = async (): Promise<ReplenishmentRequest[]> => {
    setLoading(true);
    setError(null);

    try {
      if (!profile) {
        console.log('No profile available, returning empty array');
        return [];
      }
      
      console.log('Fetching replenishment requests for profile:', profile.id);
      
      // Primero intentar con profile_id, si falla, usar solo user_id
      let { data, error: fetchError } = await supabase
        .from('replenishment_requests')
        .select(`
          *,
          product:products(*),
          supplier:suppliers(*)
        `)
        .eq('profile_id', profile.id)
        .order('requested_at', { ascending: false });

      // Si hay error, intentar sin profile_id (para registros existentes)
      if (fetchError) {
        console.log('Error con profile_id, intentando sin filtro de perfil:', fetchError);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('replenishment_requests')
          .select(`
            *,
            product:products(*),
            supplier:suppliers(*)
          `)
          .eq('requested_by', user.id)
          .order('requested_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw fallbackError;
        }
        data = fallbackData;
      }

      console.log('Successfully fetched replenishment requests:', data?.length || 0);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener solicitudes de reabastecimiento:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateReplenishmentStatus = async (
    requestId: string,
    status: ReplenishmentRequest['status'],
    notes?: string,
    productId?: string,
    quantity?: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        // Sumar al inventario si se aprueba
        if (productId && quantity) {
          // Obtener el producto actual
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('current_stock')
            .eq('id', productId)
            .single();
          if (productError) throw productError;
          const newStock = (productData?.current_stock || 0) + quantity;
          await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', productId);
        }
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { error: updateError } = await supabase
        .from('replenishment_requests')
        .update(updateData)
        .eq('id', requestId);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al actualizar estado de solicitud:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteReplenishmentRequest = async (requestId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('replenishment_requests')
        .delete()
        .eq('id', requestId);
      if (deleteError) {
        throw deleteError;
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al eliminar solicitud de reabastecimiento:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createMultiReplenishmentRequest = async (
    supplierId: string,
    products: { productId: string; name: string; quantity: number }[]
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (!supaUser) throw new Error('Usuario no autenticado');

      // Crear una solicitud por cada producto para evitar problemas con la estructura
      const results = [];
      for (const product of products) {
        const { data, error: insertError } = await supabase
          .from('replenishment_requests')
          .insert({
            product_id: product.productId,
            supplier_id: supplierId,
            quantity: product.quantity,
            status: 'pending',
            requested_by: supaUser.id,
            requested_at: new Date().toISOString(),
            profile_id: profile?.id || null,
          })
          .select(`
            *,
            product:products(*),
            supplier:suppliers(*)
          `)
          .single();
        if (insertError) {
          console.error('Error inserting replenishment request:', insertError);
          throw insertError;
        }
        results.push(data);
      }

      // Obtener el teléfono del admin
      const adminPhone = await getAdminPhone();

      // Notificar a n8n si está configurado
      if (N8N_WEBHOOK_URL) {
        try {
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'multi',
              requests: results.map(r => ({ 
                ...r, 
                productName: r.product?.name || '', 
                supplierPhone: r.supplier?.phone || '' 
              })),
              profile,
              adminPhone,
            }),
          });
        } catch (err) {
          console.error('Error notificando a n8n:', err);
        }
      }

      return results;
    } catch (err: any) {
      console.error('Error in createMultiReplenishmentRequest:', err);
      setError(err.message || 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createReplenishmentRequest,
    getReplenishmentRequests,
    updateReplenishmentStatus,
    deleteReplenishmentRequest,
    createMultiReplenishmentRequest,
  };
}; 