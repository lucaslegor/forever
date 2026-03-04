import { useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, ImagePlus } from 'lucide-react';
import styles from './RichTextEditor.module.css';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  'data-testid'?: string;
}

export function RichTextEditor({ value, onChange, minHeight = '200px' }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: { class: styles.editorImg },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: styles.editorContent,
        style: `min-height: ${minHeight}`,
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const src = reader.result as string;
                editorRef.current?.commands.setImage({ src, alt: file.name || 'Imagen' });
              };
              reader.readAsDataURL(file);
            }
            return true;
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (file?.type.startsWith('image/')) {
          event.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            editorRef.current?.commands.setImage({ src, alt: file.name || 'Imagen' });
          };
          reader.readAsDataURL(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  editorRef.current = editor;

  const insertImageFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editorRef.current?.commands.setImage({ src, alt: file.name || 'Imagen' });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) insertImageFromFile(file);
    e.target.value = '';
  };

  // Sincronizar cuando el formulario se resetea (value vacío desde fuera)
  useEffect(() => {
    if (!editor) return;
    if (value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.setContent('', false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
          title="Negrita"
          aria-label="Negrita"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
          title="Cursiva"
          aria-label="Cursiva"
        >
          <Italic size={18} />
        </button>
        <span className={styles.toolbarDivider} />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className={styles.inputFile}
          onChange={handleImageFileChange}
          aria-hidden
        />
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleImageClick}
          title="Insertar imagen en el texto"
          aria-label="Insertar imagen"
        >
          <ImagePlus size={18} />
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorWrapper} />
      <p className={styles.hint}>Podés pegar imágenes o arrastrarlas al editor. También usar el botón de imagen.</p>
    </div>
  );
}
