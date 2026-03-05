import { useEffect, useRef, useState } from "react";

function AddItemModal({ initialData, onSave, onClose, onOpenScanner }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(
        initialData.price !== undefined ? String(initialData.price) : "",
      );
      setQuantity(initialData.quantity || 1);
    }
  }, [initialData]);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  const handleFocus = (e) => {
    const target = e.target;
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity, 10) || 1,
      checked: initialData?.checked ?? false,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{initialData ? "Editar Item" : "Novo Item"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="item-name">Nome do Produto</label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={handleFocus}
              placeholder="ex: Maçãs"
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-price">Preço (R$)</label>
              <input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onFocus={handleFocus}
                placeholder="0,00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-quantity">Quantidade</label>
              <input
                id="item-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onFocus={handleFocus}
                required
              />
            </div>
          </div>

          {onOpenScanner && (
            <button
              type="button"
              className="btn-scan-label"
              onClick={onOpenScanner}
            >
              <span>⬛</span> Escanear Etiqueta
            </button>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-modal-confirm">
              {initialData ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
