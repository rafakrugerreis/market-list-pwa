function ItemCard({ item, onEdit, onDelete, onToggle }) {
  const total = (Number(item.price) * Number(item.quantity)).toFixed(2);
  const detail = `${item.quantity} ${item.quantity === 1 ? "unit" : "units"} | R$ ${Number(item.price).toFixed(2)}/unit`;

  return (
    <div className={`item-card ${item.checked ? "item-checked" : ""}`}>
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onToggle(item.id, e.target.checked)}
        />
      </div>

      <div className="item-info">
        <span className="item-name">{item.name}</span>
        <div className="item-details">{detail}</div>
      </div>

      <div className="item-price-area">
        <button
          className="btn-edit-icon"
          onClick={() => onEdit(item)}
          aria-label="Editar item"
        >
          ✏️
        </button>
        <span className="item-total">R$ {total}</span>
      </div>

      <button
        className="item-delete-btn"
        onClick={() => onDelete(item.id)}
        aria-label="Remover item"
      >
        🗑
      </button>
    </div>
  );
}

export default ItemCard;
