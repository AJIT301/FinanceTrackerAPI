// components/Transaction/Modal.jsx
import '../../styles/Modal/_Modal.scss';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    closeOnOverlayClick = false
}) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
        // If closeOnOverlayClick is false, do nothing
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-content modal-${size}`}>
                <button className="modal-close" onClick={onClose}>×</button>
                {title && <div className="modal-header"><h2>{title}</h2></div>}
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}