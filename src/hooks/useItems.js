import { useCallback, useEffect, useState } from "react";
import {
  addItem as apiAddItem,
  deleteItem as apiDeleteItem,
  updateItem as apiUpdateItem,
  fetchItems,
} from "../services/supabaseClient.js";

function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error("Erro ao buscar itens:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async (item) => {
    const newItem = await apiAddItem(item);
    setItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = async (id, changes) => {
    const updated = await apiUpdateItem(id, changes);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  };

  const deleteItem = async (id) => {
    await apiDeleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, addItem, updateItem, deleteItem };
}

export default useItems;
