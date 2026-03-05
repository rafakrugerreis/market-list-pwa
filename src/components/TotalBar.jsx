function TotalBar({ items, onAdd }) {
  const checkedItems = items.filter((item) => item.checked);
  const total = checkedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  return (
    <div className="total-bar">
      <div className="total-pill">
        <span className="total-label">Total Comprado:</span>
        <span className="total-value">
          R$ {total.toFixed(2).replace(".", ",")}
        </span>
        <span className="total-count">
          {checkedItems.length} {checkedItems.length === 1 ? "item" : "itens"}
        </span>
      </div>
      <button className="btn-fab" onClick={onAdd} aria-label="Adicionar item">
        +
      </button>
    </div>
  );
}

export default TotalBar;
