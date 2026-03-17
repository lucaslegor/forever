import { createPortal } from 'react-dom';
import styles from './AlertModal.module.css';

export interface AlertModalProps {
  open: boolean;
  title?: string;
  message: string;
  acceptLabel?: string;
  onAccept: () => void;
}

export const AlertModal = ({
  open,
  title = 'Aviso',
  message,
  acceptLabel = 'Aceptar',
  onAccept,
}: AlertModalProps) => {
  if (!open) return null;

  const content = (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      <div className={styles.dialog}>
        <div className={styles.header} id="alert-title">{title}</div>
        <div className={styles.body} id="alert-desc">{message}</div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnAccept}
            onClick={onAccept}
            autoFocus
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
