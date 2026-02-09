import styles from './ConfirmModal.module.css';

export type ConfirmVariant = 'danger' | 'primary';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div className={styles.dialog}>
        <div className={styles.header} id="confirm-title">{title}</div>
        <div className={styles.body} id="confirm-desc">{message}</div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === 'danger' ? styles.btnConfirmDanger : styles.btnConfirmPrimary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
