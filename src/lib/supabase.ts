import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          current_stock: number;
          min_stock: number;
          max_stock: number;
          unit_price: number;
          supplier_id: string | null;
          description: string | null;
          sku: string | null;
          unit: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          current_stock?: number;
          min_stock?: number;
          max_stock?: number;
          unit_price?: number;
          supplier_id?: string | null;
          description?: string | null;
          sku?: string | null;
          unit?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          current_stock?: number;
          min_stock?: number;
          max_stock?: number;
          unit_price?: number;
          supplier_id?: string | null;
          description?: string | null;
          sku?: string | null;
          unit?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          total_value: number;
          sale_date: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          total_value: number;
          sale_date?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          total_value?: number;
          sale_date?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}