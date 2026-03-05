function TotalBar({ items, onAdd }) {
  const checkedItems = items.filter((item) => item.checked);
  const total = checkedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  return (
    <div className="total-bar">
      <div className="total-pill">
        <span className="total-label">Total:</span>
        <span className="total-value">
          R$ {total.toFixed(2).replace(".", ",")}
        </span>
        <span className="total-count">{checkedItems.length} items</span>
      </div>
      <button className="btn-fab" onClick={onAdd} aria-label="Add item">
        +
      </button>
    </div>
  );
}

export default TotalBar;
