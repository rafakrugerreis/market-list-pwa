import { useState } from "react";
import AddItemModal from "../components/AddItemModal.jsx";
import CameraScanner from "../components/CameraScanner.jsx";
import ItemCard from "../components/ItemCard.jsx";
import TotalBar from "../components/TotalBar.jsx";
import useItems from "../hooks/useItems.js";

function Home() {
  const { items, loading, addItem, updateItem, deleteItem } = useItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSave = async (itemData) => {
    if (editingItem) {
      await updateItem(editingItem.id, itemData);
    } else {
      await addItem(itemData);
    }
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleScanned = async (scannedData) => {
    await addItem({
      name: scannedData.name || "Scanned Product",
      price: scannedData.price || 0,
      quantity: 1,
      checked: false,
    });
    setShowScanner(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <button className="header-menu-btn" aria-label="Menu">
          ☰
        </button>
        <h1>Grocery List</h1>
        <button className="header-settings-btn">Settings</button>
      </header>

      {/* ── Action bar ── */}
      <div className="action-bar">
        <button className="btn-add-item" onClick={openAddModal}>
          Add Item
        </button>
        <button className="btn-action" onClick={handleEdit.bind(null, null)}>
          Edit
        </button>
        <button className="btn-action">Remove</button>
      </div>

      <main className="items-list">
        {loading && <p className="loading">Loading...</p>}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <span className="empty-basket-icon">🧺</span>
            </div>
            <h2>Your list is empty</h2>
            <p>Tap Add Item to start shopping and populate your list.</p>
            <button className="btn-empty-add" onClick={openAddModal}>
              + Add Item
            </button>
          </div>
        )}
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={deleteItem}
            onToggle={(id, checked) => updateItem(id, { checked })}
          />
        ))}
      </main>

      <TotalBar items={items} onAdd={openAddModal} />

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          <span className="nav-icon-wrap">📋</span>
          List
        </button>
        <button
          className={`nav-item ${activeTab === "ocr" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("ocr");
            setShowScanner(true);
          }}
        >
          <span className="nav-icon-wrap">🔍</span>
          OCR Scanner
        </button>
        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <span className="nav-icon-wrap">👤</span>
          Profile
        </button>
      </nav>

      {showAddModal && (
        <AddItemModal
          initialData={editingItem}
          onSave={handleSave}
          onClose={handleCloseModal}
          onOpenScanner={() => {
            setShowAddModal(false);
            setShowScanner(true);
          }}
        />
      )}

      {showScanner && (
        <CameraScanner
          onScanned={handleScanned}
          onClose={() => {
            setShowScanner(false);
            setActiveTab("list");
          }}
        />
      )}
    </div>
  );
}

export default Home;
